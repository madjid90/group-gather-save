import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── AGENCEORE : TRV ÉLECTRICITÉ ───────────────────────────────────────────
async function fetchTRVElec(): Promise<{ kwh: number; abo: number; periode: string; source: string } | null> {
  try {
    const url = "https://opendata.agenceore.fr/api/explore/v2.1/catalog/datasets/tarif-bleu-eda-residentiel/records?limit=1&order_by=date_debut%20desc";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AGENCEORE élec HTTP ${res.status}`);
    const data = await res.json();
    const rec = data.results?.[0];
    if (!rec) throw new Error("AGENCEORE élec : aucun enregistrement");

    const kwh = parseFloat(rec.prix_base_kwh || rec.prix_heure_pleine_kwh || rec.prix_kwh || "0");
    const aboMensuel = parseFloat(rec.abonnement_mensuel_ttc || rec.abonnement_6kva_mensuel_ttc || "0");
    const abo = aboMensuel > 0 ? Math.round(aboMensuel * 12) : 150;
    const periode = rec.date_debut ? rec.date_debut.slice(0, 7) : "inconnue";

    if (kwh > 0.1 && kwh < 0.5) {
      return { kwh: Math.round(kwh * 10000) / 10000, abo, periode, source: "agenceore.fr/tarif-bleu-eda-residentiel" };
    }
    throw new Error(`AGENCEORE élec : valeur kwh hors plage (${kwh})`);
  } catch (e) {
    console.error("fetchTRVElec failed:", e);
    return null;
  }
}

// ─── AGENCEORE : TARIF REPÈRE GAZ ──────────────────────────────────────────
async function fetchTRVGaz(): Promise<{ kwh: number; abo: number; periode: string; source: string } | null> {
  try {
    const url = "https://opendata.agenceore.fr/api/explore/v2.1/catalog/datasets/tarif-repere-gaz-residentiel/records?limit=1&order_by=date_application%20desc";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AGENCEORE gaz HTTP ${res.status}`);
    const data = await res.json();
    const rec = data.results?.[0];
    if (!rec) throw new Error("AGENCEORE gaz : aucun enregistrement");

    const kwh = parseFloat(rec.prix_kwh_ttc || rec.tarif_kwh || rec.prix_kwh || "0");
    const aboMensuel = parseFloat(rec.abonnement_mensuel_ttc || rec.abonnement_b0_mensuel_ttc || "0");
    const abo = aboMensuel > 0 ? Math.round(aboMensuel * 12) : 230;
    const periode = rec.date_application ? rec.date_application.slice(0, 7) : "inconnue";

    if (kwh > 0.05 && kwh < 0.3) {
      return { kwh: Math.round(kwh * 10000) / 10000, abo, periode, source: "agenceore.fr/tarif-repere-gaz-residentiel" };
    }
    throw new Error(`AGENCEORE gaz : valeur kwh hors plage (${kwh})`);
  } catch (e) {
    console.error("fetchTRVGaz failed:", e);
    return null;
  }
}

// ─── SELECTRA API : MEILLEURES OFFRES ──────────────────────────────────────
async function fetchBestOffers(token: string): Promise<{
  elec: { offres: any[]; meilleur_kwh: number } | null;
  gaz: { offres: any[]; meilleur_kwh: number } | null;
} | null> {
  try {
    const [resElec, resGaz] = await Promise.all([
      fetch("https://api.selectra.com/comparator/offers?type=electricite&code_postal=75001", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }),
      fetch("https://api.selectra.com/comparator/offers?type=gaz&code_postal=75001", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }),
    ]);

    let elecOffres = null, gazOffres = null;

    if (resElec.ok) {
      const d = await resElec.json();
      const arr = Array.isArray(d) ? d : d?.offers;
      if (arr?.length) {
        const sorted = arr.sort((a: any, b: any) => a.prix_kwh - b.prix_kwh);
        elecOffres = { offres: sorted, meilleur_kwh: sorted[0].prix_kwh };
      }
    }

    if (resGaz.ok) {
      const d = await resGaz.json();
      const arr = Array.isArray(d) ? d : d?.offers;
      if (arr?.length) {
        const sorted = arr.sort((a: any, b: any) => a.prix_kwh - b.prix_kwh);
        gazOffres = { offres: sorted, meilleur_kwh: sorted[0].prix_kwh };
      }
    }

    if (elecOffres || gazOffres) return { elec: elecOffres, gaz: gazOffres };
    return null;
  } catch (e) {
    console.error("fetchBestOffers failed:", e);
    return null;
  }
}

// ─── HANDLER PRINCIPAL ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: current } = await supabase
      .from("tarifs_energie")
      .select("*")
      .eq("id", "current")
      .single();

    const log: string[] = [];
    const update: any = { updated_at: new Date().toISOString(), updated_by: "auto-cron" };

    // 1. TRV ÉLECTRICITÉ
    const trvElec = await fetchTRVElec();
    if (trvElec) {
      update.trv_elec_kwh = trvElec.kwh;
      update.trv_elec_abo_annuel = trvElec.abo;
      update.source_trv_elec = trvElec.source;
      update.periode_validite = trvElec.periode;
      log.push(`✅ TRV élec : ${trvElec.kwh} €/kWh (${trvElec.source}) — période ${trvElec.periode}`);
    } else {
      update.source_trv_elec = `fallback:${current?.trv_elec_kwh || 0.2516} (AGENCEORE indisponible)`;
      log.push(`⚠️ TRV élec : AGENCEORE indisponible — valeur conservée ${current?.trv_elec_kwh || 0.2516}`);
    }

    // 2. TARIF REPÈRE GAZ
    const trvGaz = await fetchTRVGaz();
    if (trvGaz) {
      update.trv_gaz_kwh = trvGaz.kwh;
      update.trv_gaz_abo_annuel = trvGaz.abo;
      update.source_trv_gaz = trvGaz.source;
      log.push(`✅ TRV gaz : ${trvGaz.kwh} €/kWh (${trvGaz.source}) — période ${trvGaz.periode}`);
    } else {
      update.source_trv_gaz = `fallback:${current?.trv_gaz_kwh || 0.1244} (AGENCEORE indisponible)`;
      log.push(`⚠️ TRV gaz : AGENCEORE indisponible — valeur conservée ${current?.trv_gaz_kwh || 0.1244}`);
    }

    // 3. MEILLEURES OFFRES (Selectra API)
    const TOKEN = Deno.env.get("SELECTRA_TOKEN");
    if (TOKEN) {
      const best = await fetchBestOffers(TOKEN);
      if (best?.elec) {
        update.meilleure_offre_elec_kwh = best.elec.meilleur_kwh;
        update.offres_elec_fallback = best.elec.offres.slice(0, 5);
        update.source_offres = "selectra_api";
        log.push(`✅ Offres élec : ${best.elec.offres.length} offres — meilleure ${best.elec.meilleur_kwh} €/kWh`);
      }
      if (best?.gaz) {
        update.meilleure_offre_gaz_kwh = best.gaz.meilleur_kwh;
        update.offres_gaz_fallback = best.gaz.offres.slice(0, 5);
        log.push(`✅ Offres gaz : ${best.gaz.offres.length} offres — meilleure ${best.gaz.meilleur_kwh} €/kWh`);
      }
      if (!best) {
        log.push("⚠️ Selectra API : indisponible — offres conservées");
        update.source_offres = `fallback (Selectra indisponible - ${new Date().toISOString()})`;
      }
    } else {
      log.push("⚠️ SELECTRA_TOKEN absent — offres non mises à jour");
      update.source_offres = "no_token";
    }

    // 4. UPSERT
    const { error } = await supabase
      .from("tarifs_energie")
      .upsert({ id: "current", ...update }, { onConflict: "id" });

    if (error) throw new Error(`Supabase upsert error: ${error.message}`);

    console.log("update-tarifs résultat:", log.join(" | "));

    return new Response(
      JSON.stringify({ success: true, log, updated: Object.keys(update) }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("update-tarifs error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
