import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: villes } = await supabase
    .from("villes")
    .select("slug, updated_at")
    .order("population", { ascending: false });

  const base = "https://switchly.fr";
  const today = new Date().toISOString().split("T")[0];

  const statiques = [
    `<url><loc>${base}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${base}/comparer</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${base}/faq</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    `<url><loc>${base}/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
  ];

  const dynamiques = (villes || []).flatMap((v: any) => {
    const d = v.updated_at?.split("T")[0] || today;
    return [
      `<url><loc>${base}/electricite/${v.slug}</loc><lastmod>${d}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
      `<url><loc>${base}/gaz/${v.slug}</loc><lastmod>${d}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
    ];
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...statiques, ...dynamiques].join("\n")}\n</urlset>`,
    { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } }
  );
});
