import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  campaign_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaign_id }: RequestBody = await req.json();

    if (!campaign_id) {
      throw new Error("campaign_id is required");
    }

    // Get accepted offers with user info
    const { data: offers, error: offersError } = await supabase
      .from("user_offers")
      .select(`
        client_id,
        offre_nom,
        fournisseur_nom,
        economie_estimee_mensuelle,
        economie_estimee_annuelle,
        user_id
      `)
      .eq("campaign_id", campaign_id)
      .eq("statut", "acceptee");

    if (offersError) {
      throw new Error(`Error fetching offers: ${offersError.message}`);
    }

    if (!offers || offers.length === 0) {
      // Return empty CSV with headers
      const headers = "client_id,nom,telephone,offre_nom,fournisseur_nom,economie_estimee_mensuelle,economie_estimee_annuelle";
      return new Response(headers, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="acceptations_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Get user profiles for accepted offers
    const userIds = offers.map(o => o.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nom, prenom, telephone")
      .in("id", userIds);

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Build CSV
    const BOM = "\uFEFF";
    const headers = ["client_id", "nom", "telephone", "offre_nom", "fournisseur_nom", "economie_estimee_mensuelle", "economie_estimee_annuelle"];
    
    const rows = offers.map(offer => {
      const profile = profileMap.get(offer.user_id);
      const fullName = profile ? `${profile.prenom} ${profile.nom}` : "";
      
      return [
        offer.client_id || "",
        fullName,
        profile?.telephone || "",
        offer.offre_nom || "",
        offer.fournisseur_nom || "",
        offer.economie_estimee_mensuelle?.toString() || "",
        offer.economie_estimee_annuelle?.toString() || "",
      ].map(field => `"${(field || "").replace(/"/g, '""')}"`).join(";");
    });

    const csvContent = BOM + headers.join(";") + "\n" + rows.join("\n");

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="acceptations_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error in export-accepted-offers:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
