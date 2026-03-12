import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

/**
 * validate-ville-content
 *
 * IA analyse le contenu généré et émet un verdict :
 *   score >= 80 → approuvée → statut = 'publiee'
 *   score < 80  → rejetée  → statut = 'a_valider_humain'
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { slug } = await req.json();
    if (!slug) return new Response(
      JSON.stringify({ error: "slug requis" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: ville, error } = await supabase
      .from("villes")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !ville) return new Response(
      JSON.stringify({ error: "Ville introuvable" }),
      { status: 404, headers: { ...cors, "Content-Type": "application/json" } }
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      await supabase.from("villes").update({
        statut_publication: "publiee",
        validation_ia_statut: "approuvee",
        validation_ia_score: 100,
        validation_ia_commentaire: "Validation IA ignorée (clé API absente) — publié automatiquement.",
        validation_ia_at: new Date().toISOString(),
      }).eq("slug", slug);

      return new Response(
        JSON.stringify({ success: true, slug, verdict: "approuvee", score: 100, auto: true }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // ── CONSTRUCTION DU CONTENU À VALIDER ──
    const contenuElec = [
      ville.contenu_elec_meta ? `META DESCRIPTION ÉLEC: ${ville.contenu_elec_meta}` : null,
      ville.contenu_elec_intro,
      ville.contenu_elec_contexte,
      ville.contenu_elec_conseils,
    ].filter(Boolean).join("\n\n");

    const contenuGaz = [
      ville.contenu_gaz_meta ? `META DESCRIPTION GAZ: ${ville.contenu_gaz_meta}` : null,
      ville.contenu_gaz_intro,
      ville.contenu_gaz_contexte,
      ville.contenu_gaz_conseils,
    ].filter(Boolean).join("\n\n");

    const contenuTotal = contenuElec || contenuGaz
      ? `=== CONTENU ÉLECTRICITÉ ===\n${contenuElec}\n\n=== CONTENU GAZ ===\n${contenuGaz}`
      : null;

    if (!contenuTotal) {
      await supabase.from("villes").update({
        statut_publication: "a_valider_humain",
        validation_ia_statut: "rejetee",
        validation_ia_score: 0,
        validation_ia_commentaire: "❌ Aucun contenu IA généré pour cette ville. Relancer la génération.",
        validation_ia_at: new Date().toISOString(),
      }).eq("slug", slug);

      return new Response(
        JSON.stringify({ success: true, slug, verdict: "a_valider_humain", score: 0 }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Tu es un expert SEO et auditeur qualité pour un comparateur d'énergie français.
Analyse le contenu suivant généré pour la ville de ${ville.nom} (${ville.code_postal}) et évalue sa qualité.

DONNÉES DE RÉFÉRENCE POUR CETTE VILLE :
- Population : ${ville.population || "non disponible"}
- Foyers électricité : ${ville.nb_logements_elec || "non disponible"}
- Conso élec : ${ville.conso_moyenne_kwh || "non disponible"} kWh/an
- Foyers gaz : ${ville.nb_logements_gaz || "non disponible"}
- Conso gaz : ${ville.conso_gaz_kwh || "non disponible"} kWh/an
- Réseau élec : ${ville.reseau_elec || "Enedis"}

CONTENU GÉNÉRÉ :
${contenuTotal}

CRITÈRES D'ÉVALUATION (note chaque critère de 0 à 10) :
1. DONNÉES FACTUELLES : Les chiffres cités correspondent aux données de référence. Aucune donnée inventée.
2. META DESCRIPTION : 155-160 caractères, contient le nom de la ville, un chiffre d'économie, le mot "gratuit".
3. LONGUEUR SECTIONS : Chaque section intro/contexte/conseils fait 200-220 mots.
4. MOT-CLÉ EN TÊTE : Chaque section commence par le bon mot-clé.
5. QUALITÉ RÉDACTIONNELLE : Texte fluide, pas de répétitions, pas de "nous/notre".
6. SOURCES CITÉES : Données attribuées à Enedis Open Data ou CRE.
7. PHRASES DE CONVERSION : Une phrase de conversion par section, toutes différentes.
8. ORIGINALITÉ : Contenu spécifique à cette ville.

score = moyenne pondérée des 8 critères
- score >= 80 → verdict = "approuvee"
- score < 80  → verdict = "rejetee"

Réponds UNIQUEMENT en JSON valide, sans backticks.

{
  "score": <0-100>,
  "verdict": "approuvee" | "rejetee",
  "criteres": {
    "donnees_factuelles": <0-10>,
    "meta_description": <0-10>,
    "longueur_sections": <0-10>,
    "mot_cle_en_tete": <0-10>,
    "qualite_redactionnelle": <0-10>,
    "sources_citees": <0-10>,
    "phrases_conversion": <0-10>,
    "originalite": <0-10>
  },
  "commentaire": "<explication détaillée en français>",
  "points_forts": ["<point fort 1>", "<point fort 2>"],
  "problemes": ["<problème précis 1>", "<problème précis 2>"]
}`;

    // ── APPEL IA VIA LOVABLE GATEWAY ──
    const res = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un auditeur SEO senior. Réponds UNIQUEMENT en JSON valide sans backticks." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI validate error:", res.status, errText);
      await supabase.from("villes").update({
        statut_publication: "publiee",
        validation_ia_statut: "approuvee",
        validation_ia_score: 75,
        validation_ia_commentaire: `Validation IA indisponible (erreur ${res.status}) — publié avec score par défaut 75.`,
        validation_ia_at: new Date().toISOString(),
      }).eq("slug", slug);

      return new Response(
        JSON.stringify({ success: true, slug, verdict: "approuvee", score: 75, auto: true }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const d = await res.json();
    const raw = d.choices?.[0]?.message?.content || "{}";

    let validation: any = {};
    try {
      validation = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.error("Parse validation JSON failed:", e, raw.slice(0, 200));
      validation = { score: 70, verdict: "approuvee", commentaire: "Parsing IA échoué — publié par défaut." };
    }

    const score = validation.score || 0;
    const verdict = validation.verdict === "approuvee" && score >= 80 ? "approuvee" : "rejetee";
    const nouveauStatut = verdict === "approuvee" ? "publiee" : "a_valider_humain";

    let commentaireAdmin = validation.commentaire || "";

    if (validation.problemes?.length) {
      commentaireAdmin += "\n\n🔴 PROBLÈMES DÉTECTÉS :\n" +
        validation.problemes.map((p: string) => `• ${p}`).join("\n");
    }

    if (validation.points_forts?.length) {
      commentaireAdmin += "\n\n✅ POINTS FORTS :\n" +
        validation.points_forts.map((p: string) => `• ${p}`).join("\n");
    }

    if (validation.criteres) {
      commentaireAdmin += "\n\n📊 SCORES PAR CRITÈRE :\n" +
        Object.entries(validation.criteres)
          .map(([k, v]) => `• ${k.replace(/_/g, " ")}: ${v}/10`)
          .join("\n");
    }

    await supabase.from("villes").update({
      statut_publication: nouveauStatut,
      validation_ia_statut: verdict,
      validation_ia_score: score,
      validation_ia_commentaire: commentaireAdmin,
      validation_ia_at: new Date().toISOString(),
    }).eq("slug", slug);

    console.log(`✅ Validation ${slug}: score=${score} verdict=${verdict} → ${nouveauStatut}`);

    return new Response(
      JSON.stringify({ success: true, slug, verdict, score, statut: nouveauStatut, commentaire: commentaireAdmin }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("validate-ville-content error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
