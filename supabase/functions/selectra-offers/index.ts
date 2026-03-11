import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const endpoints = [
  "https://api.selectra.com/comparator/api/offers",
  "https://api.selectra.com/comparator/api/electricite",
  "https://api.selectra.com/comparator/api/suppliers",
  "https://api.selectra.com/comparator/v1/offers",
  "https://api.selectra.com/comparator/v1/suppliers",
  "https://api.selectra.com/api/comparator/offers",
  "https://api.selectra.com/api/v1/offers",
  "https://api.selectra.com/energy/offers",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("SELECTRA_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "SELECTRA_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.all(
      endpoints.map(async (url) => {
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const body = await res.text();
          return {
            url,
            status: res.status,
            contentType: res.headers.get("content-type") || "unknown",
            body: body.substring(0, 100),
          };
        } catch (err) {
          return { url, status: null, contentType: "error", body: err.message.substring(0, 100) };
        }
      })
    );

    return new Response(JSON.stringify({ results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
