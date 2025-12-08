import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportRow {
  client_id: string;
  offre_nom?: string;
  prix_kwh?: string;
  abonnement_mensuel?: string;
  economie_estimee_mensuelle?: string;
  economie_estimee_annuelle?: string;
  commentaire_fournisseur?: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors: number;
  notFoundClientIds: string[];
  message: string;
}

function parseCSV(csvContent: string): ImportRow[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  // Remove BOM if present
  let headerLine = lines[0];
  if (headerLine.charCodeAt(0) === 0xfeff) {
    headerLine = headerLine.substring(1);
  }

  // Parse headers (handle semicolon or comma separator)
  const separator = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(separator).map((h) => 
    h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/\s+/g, "_")
  );

  console.log("Parsed headers:", headers);

  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line handling quoted values
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Create row object
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/^"|"$/g, "") || "";
    });

    // Map to ImportRow
    const importRow: ImportRow = {
      client_id: row["client_id"] || "",
      offre_nom: row["offre_nom"] || "",
      prix_kwh: row["prix_kwh"] || "",
      abonnement_mensuel: row["abonnement_mensuel"] || "",
      economie_estimee_mensuelle: row["economie_estimee_mensuelle"] || "",
      economie_estimee_annuelle: row["economie_estimee_annuelle"] || "",
      commentaire_fournisseur: row["commentaire_fournisseur"] || "",
    };

    // Only include rows with client_id and at least one offer field filled
    if (importRow.client_id && (
      importRow.offre_nom ||
      importRow.prix_kwh ||
      importRow.abonnement_mensuel ||
      importRow.economie_estimee_mensuelle ||
      importRow.economie_estimee_annuelle ||
      importRow.commentaire_fournisseur
    )) {
      rows.push(importRow);
    }
  }

  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const exportId = formData.get("export_id") as string | null;
    const fournisseurNom = formData.get("fournisseur_nom") as string | null;

    if (!file) {
      throw new Error("Aucun fichier fourni");
    }

    console.log("Received file:", file.name, "size:", file.size);
    console.log("Export ID:", exportId);
    console.log("Fournisseur:", fournisseurNom);

    // Read file content
    const content = await file.text();
    console.log("File content length:", content.length);

    // Parse CSV
    const rows = parseCSV(content);
    console.log("Parsed rows with offers:", rows.length);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          totalRows: 0,
          importedRows: 0,
          errors: 0,
          notFoundClientIds: [],
          message: "Aucune ligne avec des offres trouvée dans le fichier",
        } as ImportResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all client_ids from the file
    const clientIds = rows.map((r) => r.client_id);

    // Find mappings for these client_ids
    let query = supabase
      .from("export_client_mapping")
      .select("client_id, user_id, export_id")
      .in("client_id", clientIds);

    // If export_id is provided, filter by it
    if (exportId) {
      query = query.eq("export_id", exportId);
    }

    const { data: mappings, error: mappingError } = await query;

    if (mappingError) {
      console.error("Error fetching mappings:", mappingError);
      throw new Error("Erreur lors de la récupération des mappings");
    }

    console.log("Found mappings:", mappings?.length || 0);

    // Create mapping lookup
    const clientToUser = new Map<string, { user_id: string; export_id: string }>();
    mappings?.forEach((m) => {
      clientToUser.set(m.client_id, { user_id: m.user_id, export_id: m.export_id });
    });

    // Process rows and create offers
    const offers: {
      user_id: string;
      export_id: string | null;
      client_id: string;
      fournisseur_nom: string | null;
      offre_nom: string | null;
      prix_kwh: number | null;
      abonnement_mensuel: number | null;
      economie_estimee_mensuelle: number | null;
      economie_estimee_annuelle: number | null;
      commentaire_fournisseur: string | null;
      statut: string;
    }[] = [];

    const notFoundClientIds: string[] = [];
    let errorCount = 0;

    for (const row of rows) {
      const mapping = clientToUser.get(row.client_id);

      if (!mapping) {
        notFoundClientIds.push(row.client_id);
        errorCount++;
        continue;
      }

      try {
        const parseNum = (val: string | undefined): number | null => {
          if (!val || val.trim() === "") return null;
          const num = parseFloat(val.replace(",", "."));
          return isNaN(num) ? null : num;
        };

        offers.push({
          user_id: mapping.user_id,
          export_id: mapping.export_id,
          client_id: row.client_id,
          fournisseur_nom: fournisseurNom || null,
          offre_nom: row.offre_nom || null,
          prix_kwh: parseNum(row.prix_kwh),
          abonnement_mensuel: parseNum(row.abonnement_mensuel),
          economie_estimee_mensuelle: parseNum(row.economie_estimee_mensuelle),
          economie_estimee_annuelle: parseNum(row.economie_estimee_annuelle),
          commentaire_fournisseur: row.commentaire_fournisseur || null,
          statut: "draft",
        });
      } catch (e) {
        console.error("Error processing row:", row.client_id, e);
        errorCount++;
      }
    }

    console.log("Prepared offers:", offers.length);
    console.log("Not found client IDs:", notFoundClientIds.length);

    // Insert offers (upsert based on user_id and export_id)
    let importedCount = 0;
    if (offers.length > 0) {
      // Delete existing offers for these users in this export
      const userIds = offers.map((o) => o.user_id);
      const exportIds = [...new Set(offers.map((o) => o.export_id).filter(Boolean))];

      if (exportIds.length > 0) {
        await supabase
          .from("user_offers")
          .delete()
          .in("user_id", userIds)
          .in("export_id", exportIds);
      }

      // Insert new offers
      const { data: insertedOffers, error: insertError } = await supabase
        .from("user_offers")
        .insert(offers)
        .select();

      if (insertError) {
        console.error("Error inserting offers:", insertError);
        throw new Error("Erreur lors de l'insertion des offres");
      }

      importedCount = insertedOffers?.length || 0;
      console.log("Inserted offers:", importedCount);

      // Update user statuses
      const { error: statusError } = await supabase
        .from("profiles")
        .update({ statut: "offre_envoyee" })
        .in("id", userIds);

      if (statusError) {
        console.error("Error updating user statuses:", statusError);
      }
    }

    // Update campaign status to "offre_prete"
    const { error: campaignError } = await supabase
      .from("campaign_settings")
      .update({ statut: "offre_prete" })
      .not("id", "is", null);

    if (campaignError) {
      console.error("Error updating campaign status:", campaignError);
    } else {
      console.log("Campaign status updated to offre_prete");
    }

    const result: ImportResult = {
      success: true,
      totalRows: rows.length,
      importedRows: importedCount,
      errors: errorCount,
      notFoundClientIds: notFoundClientIds.slice(0, 10), // Limit to first 10
      message: `Import terminé : ${importedCount} offres importées sur ${rows.length} lignes.${
        errorCount > 0 ? ` ${errorCount} erreurs.` : ""
      }`,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in import-supplier-offers:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return new Response(
      JSON.stringify({
        success: false,
        totalRows: 0,
        importedRows: 0,
        errors: 1,
        notFoundClientIds: [],
        message: errorMessage,
      } as ImportResult),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
