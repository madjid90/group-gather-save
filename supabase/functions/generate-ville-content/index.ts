import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Formate un nombre avec espace comme séparateur de milliers
function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { slug, type = "both" } = await req.json();
    if (!slug) return new Response(
      JSON.stringify({ error: "slug requis" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY absente — contenu IA ignoré");
      return new Response(JSON.stringify({ success: true, slug, generated: [], warning: "no_api_key" }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

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

    const result: any = {};

    // ── AUTO-FETCH ville-data SI DONNÉES MANQUANTES ──────────────
    if (!ville.conso_moyenne_kwh) {
      console.log(`[generate] conso_moyenne_kwh manquant pour ${slug} → appel ville-data`);
      try {
        const { data: villeDataResult, error: vdErr } = await supabase.functions.invoke("ville-data", {
          body: { code_postal: ville.code_postal, code_insee: ville.code_insee }
        });
        if (!vdErr && villeDataResult) {
          const update: any = {};
          if (villeDataResult.conso_moyenne_kwh) update.conso_moyenne_kwh = villeDataResult.conso_moyenne_kwh;
          if (villeDataResult.nb_logements_elec) update.nb_logements_elec = villeDataResult.nb_logements_elec;
          if (villeDataResult.reseau_elec) update.reseau_elec = villeDataResult.reseau_elec;
          if (villeDataResult.nom_eld) update.nom_eld = villeDataResult.nom_eld;
          if (villeDataResult.conso_gaz_kwh) update.conso_gaz_kwh = villeDataResult.conso_gaz_kwh;
          if (villeDataResult.nb_logements_gaz) update.nb_logements_gaz = villeDataResult.nb_logements_gaz;
          if (Object.keys(update).length > 0) {
            await supabase.from("villes").update(update).eq("slug", slug);
            const { data: villeRefreshed } = await supabase.from("villes").select("*").eq("slug", slug).single();
            if (villeRefreshed) Object.assign(ville, villeRefreshed);
            console.log(`[generate] Données Enedis mises à jour pour ${slug}:`, update);
          }
        }
      } catch (e) {
        console.warn(`[generate] ville-data échoué pour ${slug}, utilisation des moyennes nationales:`, e);
      }
    }

    // ── LECTURE TARIFS CRE DEPUIS DB ─────────────────────────────
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
    } catch (e) { console.error("Tarifs DB lecture:", e); }

    // ── BLOQUER si données Enedis toujours manquantes ────────────
    if ((type === "electricite" || type === "both") && !ville.conso_moyenne_kwh) {
      return new Response(
        JSON.stringify({
          error: "données_insuffisantes",
          message: `Impossible de générer le contenu pour ${ville.nom} : consommation électrique non disponible dans Enedis Open Data. Vérifiez que le code INSEE ${ville.code_insee} retourne des résultats sur data.enedis.fr.`,
          slug,
          champs_manquants: ["conso_moyenne_kwh", "nb_logements_elec"]
        }),
        { status: 422, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
    if ((type === "gaz" || type === "both") && !ville.conso_gaz_kwh) {
      console.warn(`[generate] Pas de données gaz pour ${slug} — génération limitée à l'électricité`);
      if (type === "gaz") {
        return new Response(
          JSON.stringify({
            error: "données_insuffisantes",
            message: `Impossible de générer le contenu gaz pour ${ville.nom} : consommation gaz non disponible dans GRDF Open Data.`,
            slug
          }),
          { status: 422, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
    }

    // ─────────────────────────────────────────────────────────────
    // GÉNÉRATION CONTENU ÉLECTRICITÉ
    // ─────────────────────────────────────────────────────────────
    if (type === "electricite" || type === "both") {
      const consoElec = ville.conso_moyenne_kwh!;
      const reseau = ville.reseau_elec || "Enedis";
      const isELD = reseau !== "Enedis";
      const factureTRV = Math.round(consoElec * T.trv_elec + T.abo_elec);
      const econoEstim = Math.round((T.trv_elec - T.best_elec) * consoElec);
      const popFormatted = ville.population ? fmt(ville.population) : "N/A";
      const foyersFormatted = ville.nb_logements_elec ? fmt(ville.nb_logements_elec) : "N/A";

      const systemElec = `Tu es un expert SEO senior spécialisé dans les sites comparateurs d'énergie en France.
Tu as audité en détail le contenu de Selectra.info, Hellowatt.fr et Papernest.com.
Tu maîtrises les critères E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) de Google pour les pages YMYL.
Tu rédiges du contenu factuel et neutre pour Switchly.fr, comparateur d'électricité partenaire officiel Selectra.

RÈGLES DE FORME ABSOLUES (s'appliquent avant toute autre règle) :
— Réponds UNIQUEMENT en JSON valide. Zéro backtick. Zéro texte avant ou après le JSON.
— Nombres > 999 : TOUJOURS écrire avec espace insécable comme séparateur de milliers (ex: 2 103 778 · 4 800 · 1 358)
— JAMAIS la première personne du pluriel : interdit "nous", "notre", "nos", "nous vous invitons", "nous analysons"
— Troisième personne uniquement : "Switchly compare", "Switchly analyse", "Les habitants de [ville] peuvent"
— Les données Enedis sont des mesures réelles, pas des modélisations : interdit "modélisations", "estimations basées sur", "projections"
— Chaque section doit avoir une phrase de conversion DIFFÉRENTE des 2 autres — jamais la même structure`;

      const promptElec = `
OBJECTIF — RANKER SUR GOOGLE POUR :
• "comparateur électricité ${ville.nom}"
• "fournisseur électricité ${ville.nom}"  
• "changer fournisseur électricité ${ville.nom} ${ville.code_postal}"

DONNÉES OFFICIELLES (Enedis Open Data 2023 + CRE, barème en vigueur ${T.periode}) :
Ville         : ${ville.nom} (${ville.code_postal}) — ${ville.departement} — ${ville.region}
Population    : ${popFormatted} habitants
Foyers élec   : ${foyersFormatted} foyers raccordés
Conso moyenne : ${fmt(consoElec)} kWh/an
Réseau distrib: ${reseau}${isELD ? " (ELD LOCALE — pas Enedis)" : " (réseau national Enedis)"}
${ville.nom_eld ? "Nom ELD      : " + ville.nom_eld : ""}
TRV EDF ${T.periode}  : ${T.trv_elec.toFixed(4).replace(".", ",")} €/kWh (tarif réglementé — référence légale CRE, barème en vigueur)
Abonnement    : ~150€/an
Facture TRV   : ~${fmt(factureTRV)}€/an
Meilleure offre marché libre : ~${T.best_elec.toFixed(4).replace(".", ",")} €/kWh
Économie max  : ${fmt(econoEstim)}€/an vs TRV

CHAMP SÉMANTIQUE (intégrer naturellement, sans forcer) :
tarif réglementé EDF · marché libre · offre fixe · offre variable · sans engagement
PDL (Point De Livraison) · compteur Linky · résiliation gratuite · kWh · abonnement annuel
fournisseur alternatif · CRE · puissance souscrite · ${ville.departement} · ${ville.region}

RÈGLES RÉDACTIONNELLES (toutes obligatoires) :
1.  Section intro    → "électricité à ${ville.nom}" dans les 10 PREMIERS mots
2.  Section contexte → "fournisseur d'électricité à ${ville.nom}" dans les 10 premiers mots
3.  Section conseils → "changer de fournisseur électricité à ${ville.nom}" dans les 10 premiers mots
4.  Texte CONTINU dans chaque section — zéro liste, zéro tiret, zéro sous-titre
5.  "${ville.nom}" minimum 4 fois par section
6.  Sources dans les phrases : "selon Enedis Open Data 2023" ou "d'après la CRE, barème en vigueur" (jamais seuls, jamais "CRE 2026")
7.  Longueur : 200-220 mots par section — COMPTER avant de répondre
8.  Varier les débuts de phrase — jamais 2 phrases consécutives commençant de la même façon
9.  BANNIS absolus : "En conclusion" · "Il est important" · "N'hésitez pas" · "En effet" · "Ainsi" · "Notons que" · "Il convient"
10. INTERDIT : inventer des données non fournies ci-dessus
12. meta_description : 155-160 caractères EXACTEMENT — contenir "électricité ${ville.nom}" + "${fmt(econoEstim)}€" + "gratuit"
${isELD ? `13. OBLIGATOIRE section contexte : expliquer en 2 phrases ce qu'est ${ville.nom_eld || "cette ELD"} et confirmer que le libre choix du fournisseur reste possible` : ""}

PHRASES DE CONVERSION — 1 par section, TOUTES DIFFÉRENTES, jamais publicitaire :
• Section intro    → finir par une phrase sur le fait que Switchly compare gratuitement les offres à ${ville.nom}
• Section contexte → finir par une phrase sur le fait que les habitants de ${ville.nom} peuvent simuler leurs économies en quelques secondes
• Section conseils → finir par une phrase sur le fait que la comparaison est sans engagement sur Switchly

STRUCTURE JSON ATTENDUE :
{
  "meta_description": "155-160 caractères.",
  "intro": "200-220 mots. Commencer par 'L'électricité à ${ville.nom}...'",
  "contexte": "200-220 mots. Commencer par 'Le fournisseur d'électricité à ${ville.nom}...'",
  "conseils": "200-220 mots. Commencer par 'Changer de fournisseur électricité à ${ville.nom}...'"
}`;

      const contentElec = await callAI(LOVABLE_API_KEY, systemElec, promptElec);

      if (contentElec) {
        result.contenu_elec_meta = contentElec.meta_description || null;
        result.contenu_elec_intro = contentElec.intro || null;
        result.contenu_elec_contexte = contentElec.contexte || null;
        result.contenu_elec_conseils = contentElec.conseils || null;
      }
    }

    // Pause entre les 2 appels pour respecter le rate limit
    if (type === "both") await new Promise(r => setTimeout(r, 3000));

    // ─────────────────────────────────────────────────────────────
    // GÉNÉRATION CONTENU GAZ
    // ─────────────────────────────────────────────────────────────
    if ((type === "gaz" || type === "both") && ville.conso_gaz_kwh) {
      const consoGaz = ville.conso_gaz_kwh!;
      const hasFoyers = (ville.nb_logements_gaz || 0) > 0;
      const factureTRV = Math.round(consoGaz * T.trv_gaz + T.abo_gaz);
      const econoEstim = Math.round((T.trv_gaz - T.best_gaz) * consoGaz);
      const popFormatted = ville.population ? fmt(ville.population) : "N/A";
      const foyersGazFmt = ville.nb_logements_gaz ? fmt(ville.nb_logements_gaz) : "N/A";

      const systemGaz = `Tu es un expert SEO senior spécialisé dans les sites comparateurs d'énergie en France.
Tu as audité en détail le contenu de Selectra.info, Hellowatt.fr et Papernest.com.
Tu maîtrises les critères E-E-A-T de Google pour les pages YMYL.
Tu rédiges du contenu factuel et neutre pour Switchly.fr, comparateur de gaz partenaire officiel Selectra.

RÈGLES DE FORME ABSOLUES (s'appliquent avant toute autre règle) :
— Réponds UNIQUEMENT en JSON valide. Zéro backtick. Zéro texte avant ou après le JSON.
— Nombres > 999 : TOUJOURS écrire avec espace comme séparateur de milliers (ex: 11 000 · 1 598 · 410)
— JAMAIS la première personne du pluriel : interdit "nous", "notre", "nos", "nous vous invitons"
— Troisième personne uniquement : "Switchly compare", "Les habitants de [ville] peuvent"
— Les données GRDF sont des mesures réelles : interdit "modélisations", "estimations basées sur", "projections"
— Chaque section doit avoir une phrase de conversion DIFFÉRENTE des 2 autres`;

      const promptGaz = `
OBJECTIF — RANKER SUR GOOGLE POUR :
• "comparateur gaz ${ville.nom}"
• "fournisseur gaz naturel ${ville.nom}"
• "changer fournisseur gaz ${ville.nom} ${ville.code_postal}"

DONNÉES OFFICIELLES (GRDF Open Data 2023 + CRE, barème en vigueur ${T.periode}) :
Ville         : ${ville.nom} (${ville.code_postal}) — ${ville.departement} — ${ville.region}
Population    : ${popFormatted} habitants
Foyers gaz    : ${foyersGazFmt} foyers raccordés au gaz naturel
Conso moyenne : ${fmt(consoGaz)} kWh/an
Distributeur  : GRDF (réseau national — 200 000 km de canalisations)
Tarif repère  : ${T.trv_gaz.toFixed(4).replace(".", ",")} €/kWh (CRE ${T.periode} — référence légale)
Abonnement    : ~230€/an
Facture repère: ~${fmt(factureTRV)}€/an
Meilleure offre : ~${T.best_gaz.toFixed(4).replace(".", ",")} €/kWh
Économie max  : ${fmt(econoEstim)}€/an vs tarif repère
${!hasFoyers ? "ATTENTION : raccordement gaz PARTIEL à " + ville.nom + " — préciser de vérifier avant souscription" : "Raccordement gaz : TOTAL à " + ville.nom}

CHAMP SÉMANTIQUE (intégrer naturellement) :
tarif repère gaz · marché libre gaz · offre fixe gaz · offre indexée TTF · sans engagement
PCE (Point de Comptage et d'Estimation) · GRDF · résiliation gratuite · biogaz · ECS
chauffage gaz · chaudière · kWh gaz · fournisseur alternatif gaz · CRE
${ville.departement} · ${ville.region}

RÈGLES RÉDACTIONNELLES (toutes obligatoires) :
1.  Section intro    → "gaz naturel à ${ville.nom}" dans les 10 PREMIERS mots
2.  Section contexte → "fournisseur de gaz à ${ville.nom}" dans les 10 premiers mots
3.  Section conseils → "changer de fournisseur gaz à ${ville.nom}" dans les 10 premiers mots
4.  Texte CONTINU — zéro liste, zéro tiret, zéro sous-titre dans le corps
5.  "${ville.nom}" minimum 4 fois par section
6.  Sources dans les phrases : "selon GRDF Open Data 2023" ou "d'après la CRE 2026"
7.  Longueur : 200-220 mots par section — COMPTER avant de répondre
8.  Varier les débuts de phrase — jamais 2 phrases consécutives commençant pareil
9.  BANNIS absolus : "En conclusion" · "Il est important" · "N'hésitez pas" · "En effet" · "Ainsi" · "Notons que"
10. INTERDIT : inventer des données non fournies
12. meta_description : 155-160 caractères EXACTEMENT — contenir "gaz ${ville.nom}" + "${fmt(econoEstim)}€" + "gratuit"
${!hasFoyers ? `12. OBLIGATOIRE section intro : préciser que le gaz n'est pas disponible partout à ${ville.nom} — vérifier son raccordement sur grdf.fr avant de souscrire` : ""}

PHRASES DE CONVERSION — 1 par section, TOUTES DIFFÉRENTES, jamais publicitaire :
• Section intro    → finir par une phrase sur le fait que Switchly compare gratuitement les offres gaz à ${ville.nom}
• Section contexte → finir par une phrase sur le fait que les habitants de ${ville.nom} peuvent simuler leurs économies sur leur facture gaz
• Section conseils → finir par une phrase sur le fait que la simulation est gratuite et sans engagement sur Switchly

STRUCTURE JSON ATTENDUE :
{
  "meta_description": "155-160 caractères.",
  "intro": "200-220 mots. Commencer par 'Le gaz naturel à ${ville.nom}...'",
  "contexte": "200-220 mots. Commencer par 'Le fournisseur de gaz à ${ville.nom}...'",
  "conseils": "200-220 mots. Commencer par 'Changer de fournisseur gaz à ${ville.nom}...'"
}`;

      const contentGaz = await callAI(LOVABLE_API_KEY, systemGaz, promptGaz);

      if (contentGaz) {
        result.contenu_gaz_meta = contentGaz.meta_description || null;
        result.contenu_gaz_intro = contentGaz.intro || null;
        result.contenu_gaz_contexte = contentGaz.contexte || null;
        result.contenu_gaz_conseils = contentGaz.conseils || null;
      }
    }

    result.contenu_genere_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("villes")
      .update(result)
      .eq("slug", slug);

    if (updateError) throw new Error(`Supabase update error: ${updateError.message}`);

    return new Response(
      JSON.stringify({ success: true, slug, generated: Object.keys(result) }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("generate-ville-content error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});

async function callAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any | null> {
  try {
    const response = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429) {
      console.error("AI gateway rate limited (429)");
      return null;
    }
    if (response.status === 402) {
      console.error("AI gateway payment required (402)");
      return null;
    }
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
