import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = () => Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * batch-import
 *
 * Gère la génération de pages en arrière-plan.
 *
 * Actions disponibles :
 *   start  → créer un nouveau job avec une liste de CPs
 *   resume → reprendre un job existant (batch_id requis)
 *   status → état d'un job
 *   pause  → mettre en pause
 *
 * Pipeline par ville :
 *   1. ville-data (Enedis)
 *   2. generate-ville-content (Gemini)
 *   3. validate-ville-content (Gemini audit)
 *   → si score >= 80 : publié automatiquement
 *   → si score < 80  : mis en file "a_valider_humain"
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const body = await req.json();
    const { action = "start", batch_id, codes_postaux = [], batch_size = 3 } = body;

    const supabase = createClient(SUPABASE_URL(), SERVICE_KEY());

    // ── STATUS ──────────────────────────────────────────────────
    if (action === "status") {
      if (!batch_id) return new Response(
        JSON.stringify({ error: "batch_id requis" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
      const { data: job } = await supabase
        .from("import_jobs").select("*").eq("batch_id", batch_id).single();
      return new Response(
        JSON.stringify({ success: true, job }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // ── PAUSE ────────────────────────────────────────────────────
    if (action === "pause") {
      await supabase.from("import_jobs")
        .update({ statut: "pause", updated_at: new Date().toISOString() })
        .eq("batch_id", batch_id);
      return new Response(
        JSON.stringify({ success: true, message: "Job mis en pause" }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // ── START ────────────────────────────────────────────────────
    let job: any;

    if (action === "start") {
      if (!codes_postaux.length) return new Response(
        JSON.stringify({ error: "codes_postaux requis" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );

      const newBatchId = `batch_${Date.now()}`;
      const { data: newJob, error: jobError } = await supabase
        .from("import_jobs")
        .insert({
          batch_id: newBatchId,
          statut: "en_cours",
          total_cps: codes_postaux.length,
          traites: 0,
          publiees: 0,
          a_valider: 0,
          erreurs: 0,
          codes_postaux,
          cp_restants: codes_postaux,
        })
        .select().single();

      if (jobError) throw new Error(`Création job: ${jobError.message}`);
      job = newJob;

    } else if (action === "resume") {
      const { data: existingJob } = await supabase
        .from("import_jobs").select("*").eq("batch_id", batch_id).single();

      if (!existingJob) return new Response(
        JSON.stringify({ error: "Job introuvable" }),
        { status: 404, headers: { ...cors, "Content-Type": "application/json" } }
      );

      if (existingJob.statut === "termine") return new Response(
        JSON.stringify({ success: true, message: "Job déjà terminé", job: existingJob }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );

      await supabase.from("import_jobs")
        .update({ statut: "en_cours", updated_at: new Date().toISOString() })
        .eq("batch_id", batch_id);

      job = { ...existingJob, statut: "en_cours" };
    }

    // ── TRAITEMENT DU BATCH ──────────────────────────────────────
    const cpsBatch = (job.cp_restants || []).slice(0, batch_size);
    const stats = { publiees: 0, a_valider: 0, erreurs: 0 };
    const cpTraites: string[] = [];

    for (const cp of cpsBatch) {
      try {
        console.log(`[batch-import] Traitement ${cp}...`);

        // Vérifier si la ville existe déjà et est publiée
        const { data: existing } = await supabase
          .from("villes")
          .select("slug, statut_publication")
          .eq("code_postal", cp)
          .maybeSingle();

        if (existing?.statut_publication === "publiee") {
          console.log(`[batch-import] ${cp} déjà publiée, skip`);
          cpTraites.push(cp);
          continue;
        }

        // Mettre à jour le statut à 'generation'
        if (existing?.slug) {
          await supabase.from("villes")
            .update({
              statut_publication: "generation",
              import_batch_id: job.batch_id,
              generation_tentatives: (existing as any).generation_tentatives + 1 || 1,
            })
            .eq("slug", existing.slug);
        }

        // ── ÉTAPE 1 : Données Enedis ─────────────────────────
        const villeRes = await fetch(`${SUPABASE_URL()}/functions/v1/ville-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_KEY()}`,
          },
          body: JSON.stringify({ code_postal: cp }),
        });

        if (!villeRes.ok) {
          console.error(`[batch-import] ville-data ${cp} failed: ${villeRes.status}`);
          stats.erreurs++;
          cpTraites.push(cp);
          continue;
        }

        const villeData = await villeRes.json();
        if (!villeData.success || !villeData.data) {
          console.error(`[batch-import] ville-data ${cp} no data`);
          stats.erreurs++;
          cpTraites.push(cp);
          continue;
        }

        const slug = villeData.data.slug;

        // Marquer en génération IA
        await supabase.from("villes")
          .update({ statut_publication: "generation", import_batch_id: job.batch_id })
          .eq("slug", slug);

        // ── ÉTAPE 2 : Génération contenu IA ──────────────────
        await new Promise(r => setTimeout(r, 2000)); // Rate limit Gemini

        const genRes = await fetch(`${SUPABASE_URL()}/functions/v1/generate-ville-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_KEY()}`,
          },
          body: JSON.stringify({ slug, type: "both" }),
        });

        // Ne pas bloquer si génération IA échoue (GEMINI_API_KEY absente = warning)
        if (!genRes.ok) {
          console.warn(`[batch-import] generate-ville-content ${slug} failed: ${genRes.status}`);
        }

        // ── ÉTAPE 3 : Validation IA ───────────────────────────
        await new Promise(r => setTimeout(r, 1000));

        const valRes = await fetch(`${SUPABASE_URL()}/functions/v1/validate-ville-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_KEY()}`,
          },
          body: JSON.stringify({ slug }),
        });

        if (valRes.ok) {
          const valData = await valRes.json();
          if (valData.verdict === "approuvee") {
            stats.publiees++;
          } else {
            stats.a_valider++;
          }
        } else {
          // Validation échouée → publier quand même
          await supabase.from("villes")
            .update({ statut_publication: "publiee" })
            .eq("slug", slug);
          stats.publiees++;
        }

        cpTraites.push(cp);

      } catch (e: any) {
        console.error(`[batch-import] Erreur ${cp}:`, e.message);
        stats.erreurs++;
        cpTraites.push(cp);
      }
    }

    // ── MISE À JOUR DU JOB ───────────────────────────────────────
    const cpRestantsUpdated = (job.cp_restants || []).filter(
      (cp: string) => !cpTraites.includes(cp)
    );

    const isTermine = cpRestantsUpdated.length === 0;

    await supabase.from("import_jobs").update({
      statut: isTermine ? "termine" : "en_attente",
      traites: (job.traites || 0) + cpTraites.length,
      publiees: (job.publiees || 0) + stats.publiees,
      a_valider: (job.a_valider || 0) + stats.a_valider,
      erreurs: (job.erreurs || 0) + stats.erreurs,
      cp_restants: cpRestantsUpdated,
      updated_at: new Date().toISOString(),
    }).eq("batch_id", job.batch_id);

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: job.batch_id,
        batch_traite: cpTraites.length,
        stats,
        restants: cpRestantsUpdated.length,
        termine: isTermine,
        message: isTermine
          ? `✅ Import terminé — ${job.publiees + stats.publiees} publiées, ${job.a_valider + stats.a_valider} à valider`
          : `Batch ${cpsBatch.length} traité — ${cpRestantsUpdated.length} restants`,
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("batch-import error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
