import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (path.startsWith("/electricite/")) {
      const slug = path.replace("/electricite/", "").replace(/\/$/, "");
      const { data: ville } = await supabase.from("villes").select("*").eq("slug", slug).single();
      if (!ville) return new Response("Not found", { status: 404, headers: cors });
      return new Response(renderVillePage(ville, "electricite"), { headers: { ...cors, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    }

    if (path.startsWith("/gaz/")) {
      const slug = path.replace("/gaz/", "").replace(/\/$/, "");
      const { data: ville } = await supabase.from("villes").select("*").eq("slug", slug).single();
      if (!ville) return new Response("Not found", { status: 404, headers: cors });
      return new Response(renderVillePage(ville, "gaz"), { headers: { ...cors, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    }

    if (path === "/") {
      return new Response(renderHomePage(), { headers: { ...cors, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=1800" } });
    }

    return new Response("Not found", { status: 404, headers: cors });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500, headers: cors });
  }
});

function renderVillePage(v: any, type: string): string {
  const isElec = type === "electricite";
  const label = isElec ? "électricité" : "gaz naturel";
  const conso = isElec ? (v.conso_moyenne_kwh || 4800) : (v.conso_gaz_kwh || 11000);
  const prixRef = isElec ? 0.2516 : 0.1244;
  const econoMax = Math.round((prixRef - (isElec ? 0.2160 : 0.0870)) * conso);
  const canon = `https://switchly.fr/${type}/${v.slug}`;
  const reseau = isElec ? (v.reseau_elec || "Enedis") : (v.reseau_gaz || "GRDF");
  const titlePage = `Comparateur ${label} ${v.nom} (${v.code_postal}) — Meilleure offre 2026`;
  const desc = `Comparez les offres ${label} à ${v.nom}. Conso moyenne ${conso} kWh/an. Réseau ${reseau}. Économisez jusqu'à ${econoMax}€/an. Gratuit.`;

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${titlePage}</title><meta name="description" content="${desc}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canon}"/><meta property="og:title" content="${titlePage}"/><meta property="og:description" content="${desc}"/><meta property="og:url" content="${canon}"/><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":`Quel est le meilleur fournisseur de ${label} à ${v.nom} ?`,"acceptedAnswer":{"@type":"Answer","text":`En 2026, économisez jusqu'à ${econoMax}€/an à ${v.nom}. Comparez sur Switchly.`}}]})}</script></head><body><nav><a href="https://switchly.fr">Switchly</a> › <a href="https://switchly.fr/${type}">${isElec?"Électricité":"Gaz"}</a> › ${v.nom}</nav><main><h1>Comparateur ${label} ${v.nom} (${v.code_postal})</h1><p>Économisez jusqu'à <strong>${econoMax}€/an</strong>. Gratuit, sans engagement.</p><a href="https://switchly.fr/comparer?cp=${v.code_postal}&type=${type}">Comparer gratuitement →</a></main><footer><p>© 2026 Switchly</p></footer></body></html>`;
}

function renderHomePage(): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Switchly — Comparateur électricité et gaz</title><meta name="description" content="Comparateur gratuit. Économisez jusqu'à 300€/an."/><link rel="canonical" href="https://switchly.fr"/></head><body><main><h1>Économisez jusqu'à 300€/an sur vos factures énergie</h1><a href="https://switchly.fr/comparer">Comparer gratuitement</a></main></body></html>`;
}
