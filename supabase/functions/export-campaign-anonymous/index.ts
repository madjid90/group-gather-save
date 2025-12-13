import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get campaign_id from request body (optional)
    let campaignId: string | null = null;
    try {
      const body = await req.json();
      campaignId = body.campaign_id || null;
    } catch {
      // No body provided
    }

    console.log("Starting anonymous export for campaign:", campaignId || "all participants");

    // Use the provided campaign_id directly
    const actualCampaignId = campaignId;

    // Fetch all users included in campaign (inclusion_campagne = true)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        code_postal,
        ville,
        inclusion_campagne
      `)
      .eq("inclusion_campagne", true);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Erreur lors de la récupération des profils");
    }

    console.log(`Found ${profiles?.length || 0} participants`);

    // Fetch housing profiles for these users
    const userIds = profiles?.map((p) => p.id) || [];
    
    const { data: housingProfiles, error: housingError } = await supabase
      .from("housing_profiles")
      .select("*")
      .in("user_id", userIds);

    if (housingError) {
      console.error("Error fetching housing profiles:", housingError);
      throw new Error("Erreur lors de la récupération des profils logement");
    }

    console.log(`Found ${housingProfiles?.length || 0} housing profiles`);

    // Create a map of housing profiles by user_id
    const housingMap = new Map();
    housingProfiles?.forEach((hp) => {
      housingMap.set(hp.user_id, hp);
    });

    // Create an export record to store the mapping
    const { data: exportRecord, error: exportError } = await supabase
      .from("campaign_exports")
      .insert({
        campaign_id: actualCampaignId,
        total_profiles: profiles?.length || 0,
      })
      .select()
      .single();

    if (exportError) {
      console.error("Error creating export record:", exportError);
      throw new Error("Erreur lors de la création de l'export");
    }

    console.log("Created export record:", exportRecord.id);

    // Generate CSV content and save mappings
    const headers = [
      "client_id",
      "type_logement",
      "surface_m2",
      "nb_occupants",
      "isolation",
      "chauffage",
      "chauffe_eau_electrique",
      "fournisseur_elec_actuel",
      "option_tarifaire",
      "puissance_kVA",
      "facture_elec_moyenne",
      "type_internet",
      "fournisseur_internet",
      "facture_internet",
      "eligibilite_fibre",
      "equipements",
      "region_departement",
      "offre_nom",
      "prix_kwh",
      "abonnement_mensuel",
      "economie_estimee_mensuelle",
      "economie_estimee_annuelle",
      "commentaire_fournisseur",
    ];

    // Generate rows and collect mappings
    const rows: string[][] = [];
    const mappings: { export_id: string; client_id: string; user_id: string }[] = [];
    let clientIndex = 1;

    profiles?.forEach((profile) => {
      const housing = housingMap.get(profile.id);
      
      // Generate anonymous client ID (e.g., CLIENT_001)
      const clientId = `CLIENT_${String(clientIndex).padStart(3, "0")}`;
      clientIndex++;

      // Save mapping
      mappings.push({
        export_id: exportRecord.id,
        client_id: clientId,
        user_id: profile.id,
      });

      // Extract department from postal code (first 2 digits)
      const department = profile.code_postal ? profile.code_postal.substring(0, 2) : "";

      // Format equipment as JSON-like string
      const equipments = housing?.equipements_energivores
        ? JSON.stringify(housing.equipements_energivores)
        : "";

      const row = [
        clientId,
        housing?.type_logement || "",
        housing?.surface?.toString() || "",
        housing?.nombre_occupants?.toString() || "",
        housing?.isolation || "",
        housing?.mode_chauffage || "",
        housing?.chauffe_eau_electrique ? "Oui" : "Non",
        housing?.fournisseur_electricite || "",
        housing?.option_tarifaire || "",
        housing?.puissance_compteur || "",
        housing?.montant_facture?.toString() || "",
        housing?.type_connexion || "",
        housing?.fournisseur_internet || "",
        housing?.prix_mensuel_internet?.toString() || "",
        housing?.eligible_fibre ? "Oui" : "Non",
        equipments,
        department,
        "", // offre_nom - à remplir par le fournisseur
        "", // prix_kwh - à remplir par le fournisseur
        "", // abonnement_mensuel - à remplir par le fournisseur
        "", // economie_estimee_mensuelle - à remplir par le fournisseur
        "", // economie_estimee_annuelle - à remplir par le fournisseur
        "", // commentaire_fournisseur - à remplir par le fournisseur
      ];

      rows.push(row);
    });

    // Save all mappings
    if (mappings.length > 0) {
      const { error: mappingError } = await supabase
        .from("export_client_mapping")
        .insert(mappings);

      if (mappingError) {
        console.error("Error saving mappings:", mappingError);
        // Don't throw, continue with export
      } else {
        console.log(`Saved ${mappings.length} client mappings`);
      }
    }

    // Create CSV content with BOM for Excel compatibility
    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      headers.join(";") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");

    console.log(`Generated CSV with ${rows.length} rows`);

    // Update campaign status to "en_negociation"
    const { error: updateError } = await supabase
      .from("campaign_settings")
      .update({ statut: "en_negociation" })
      .not("id", "is", null);

    if (updateError) {
      console.error("Error updating campaign status:", updateError);
    } else {
      console.log("Campaign status updated to en_negociation");
    }

    // Return CSV file with export_id in header for reference
    const filename = `export_anonymise_${exportRecord.id.substring(0, 8)}_${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Export-Id": exportRecord.id,
      },
    });
  } catch (error: unknown) {
    console.error("Error in export-campaign-anonymous:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
