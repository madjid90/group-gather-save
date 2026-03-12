import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { slug, type = "both" } = await req.json();
    if (!slug) return new Response(JSON.stringify({ error: "slug requis" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY absente — contenu IA ignoré");
      return new Response(JSON.stringify({ success: true, slug, generated: [], warning: "no_api_key" }), 
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: ville, error } = await supabase.from("villes").select("*").eq("slug", slug).single();
    if (error || !ville) return new Response(JSON.stringify({ error: "Ville introuvable" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });

    // ── LECTURE TARIFS DEPUIS DB ──
    let T = {
      trv_elec: 0.2516,
      abo_elec: 150,
      best_elec: 0.2160,
      trv_gaz: 0.1244,
      abo_gaz: 230,
      best_gaz: 0.0870,
      periode: "2026",
    };
    try {
      const { data: tarifs } = await supabase
        .from("tarifs_energie")
        .select("trv_elec_kwh, trv_elec_abo_annuel, meilleure_offre_elec_kwh, trv_gaz_kwh, trv_gaz_abo_annuel, meilleure_offre_gaz_kwh, periode_validite")
        .eq("id", "current")
        .single();
      if (tarifs) {
        T.trv_elec = tarifs.trv_elec_kwh || T.trv_elec;
        T.abo_elec = tarifs.trv_elec_abo_annuel || T.abo_elec;
        T.best_elec = tarifs.meilleure_offre_elec_kwh || T.best_elec;
        T.trv_gaz = tarifs.trv_gaz_kwh || T.trv_gaz;
        T.abo_gaz = tarifs.trv_gaz_abo_annuel || T.abo_gaz;
        T.best_gaz = tarifs.meilleure_offre_gaz_kwh || T.best_gaz;
        T.periode = tarifs.periode_validite || T.periode;
      }
    } catch (e) { console.error("Tarifs lecture:", e); }

    const result: any = {};

    // Generate electricity content
    if (type === "electricite" || type === "both") {
      const consoElec = ville.conso_moyenne_kwh || 4800;
      const reseau = ville.reseau_elec || "Enedis";
      const factureTRV = Math.round(consoElec * T.trv_elec + T.abo_elec);
      const econoEstim = Math.round((T.trv_elec - T.best_elec) * consoElec);

      const prompt = `Tu es un expert SEO spécialisé dans les comparateurs d'énergie en France. Rédige pour Switchly.fr.

DONNÉES OFFICIELLES pour ${ville.nom} (${ville.code_postal}) — ${ville.departement} — ${ville.region} :
- Population : ${ville.population} habitants
- Foyers élec : ${ville.nb_logements_elec || 'N/A'} foyers raccordés
- Conso locale : ${consoElec} kWh/an (moyenne Enedis 2023)
- Réseau : ${reseau}${ville.nom_eld ? ' — ELD : ' + ville.nom_eld : ''}
- TRV EDF ${T.periode} : ${Number(T.trv_elec).toFixed(4).replace(".", ",")} €/kWh — Facture TRV : ~${factureTRV}€/an
- Meilleure offre marché libre : ~${Number(T.best_elec).toFixed(4).replace(".", ",")} €/kWh — Économie max : ${econoEstim}€/an

Génère 3 sections de texte unique pour la page /electricite/${ville.slug}. Chaque section ~210 mots. Texte continu sans listes. "${ville.nom}" minimum 4 fois par section. Cite les sources (Enedis, CRE ${T.periode}). Une phrase de conversion naturelle par section vers Switchly.

IMPORTANT: Réponds UNIQUEMENT en JSON valide, sans backticks, sans texte avant/après.`;

      const contentElec = await callAI(LOVABLE_API_KEY, prompt, `{
  "meta_description": "155-160 chars avec 'électricité ${ville.nom}', ${econoEstim}€, 'gratuit'",
  "intro": "210 mots. Commencer par 'L'électricité à ${ville.nom}...' Exposer l'économie possible.",
  "contexte": "210 mots. Commencer par 'Le fournisseur d'électricité à ${ville.nom}...' Expliquer séparation distribution/fourniture.",
  "conseils": "210 mots. Commencer par 'Changer de fournisseur électricité à ${ville.nom}...' Guide pratique."
}`);

      if (contentElec) {
        result.contenu_elec_meta = contentElec.meta_description || null;
        result.contenu_elec_intro = contentElec.intro || null;
        result.contenu_elec_contexte = contentElec.contexte || null;
        result.contenu_elec_conseils = contentElec.conseils || null;
      }
    }

    // Generate gas content
    if (type === "gaz" || type === "both") {
      const consoGaz = ville.conso_gaz_kwh || 11000;
      const factureTRV = Math.round(consoGaz * T.trv_gaz + T.abo_gaz);
      const econoEstim = Math.round((T.trv_gaz - T.best_gaz) * consoGaz);

      const prompt = `Tu es un expert SEO spécialisé dans les comparateurs d'énergie en France. Rédige pour Switchly.fr.

DONNÉES OFFICIELLES pour ${ville.nom} (${ville.code_postal}) — ${ville.departement} — ${ville.region} :
- Population : ${ville.population} habitants
- Foyers gaz : ${ville.nb_logements_gaz || 'N/A'} foyers raccordés
- Conso locale : ${consoGaz} kWh/an (moyenne GRDF 2023)
- Distributeur : GRDF
- Tarif repère ${T.periode} : ${Number(T.trv_gaz).toFixed(4).replace(".", ",")} €/kWh — Facture repère : ~${factureTRV}€/an
- Meilleure offre marché libre : ~${Number(T.best_gaz).toFixed(4).replace(".", ",")} €/kWh — Économie max : ${econoEstim}€/an

Génère 3 sections de texte unique pour la page /gaz/${ville.slug}. Chaque section ~210 mots. Texte continu sans listes. "${ville.nom}" minimum 4 fois par section. Cite les sources (GRDF, CRE ${T.periode}). Une phrase de conversion naturelle par section vers Switchly.

IMPORTANT: Réponds UNIQUEMENT en JSON valide, sans backticks, sans texte avant/après.`;

      const contentGaz = await callAI(LOVABLE_API_KEY, prompt, `{
  "meta_description": "155-160 chars avec 'gaz ${ville.nom}', ${econoEstim}€, 'gratuit'",
  "intro": "210 mots. Commencer par 'Le gaz naturel à ${ville.nom}...'",
  "contexte": "210 mots. Commencer par 'Le fournisseur de gaz à ${ville.nom}...'",
  "conseils": "210 mots. Commencer par 'Changer de fournisseur gaz à ${ville.nom}...'"
}`);

      if (contentGaz) {
        result.contenu_gaz_meta = contentGaz.meta_description || null;
        result.contenu_gaz_intro = contentGaz.intro || null;
        result.contenu_gaz_contexte = contentGaz.contexte || null;
        result.contenu_gaz_conseils = contentGaz.conseils || null;
      }
    }

    result.contenu_genere_at = new Date().toISOString();

    const { error: updateError } = await supabase.from("villes").update(result).eq("slug", slug);
    if (updateError) throw new Error(`Update error: ${updateError.message}`);

    return new Response(JSON.stringify({ success: true, slug, generated: Object.keys(result) }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("generate-ville-content error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

async function callAI(apiKey: string, userPrompt: string, formatHint: string): Promise<any | null> {
  try {
    const response = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu es un expert SEO senior spécialisé dans les sites comparateurs d'énergie en France. Tu rédiges du contenu E-E-A-T de niveau professionnel. Réponds UNIQUEMENT en JSON valide sans backticks. Format attendu : ${formatHint}`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return null;
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("AI parse error:", e);
    return null;
  }
}
