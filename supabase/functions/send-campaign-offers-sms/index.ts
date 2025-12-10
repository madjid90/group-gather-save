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
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaign_id }: RequestBody = await req.json();

    if (!campaign_id) {
      throw new Error("campaign_id is required");
    }

    // Get all draft offers for this campaign with user info
    const { data: offers, error: offersError } = await supabase
      .from("user_offers")
      .select(`
        id,
        user_id,
        offer_token,
        offre_nom,
        economie_estimee_mensuelle,
        economie_estimee_annuelle
      `)
      .eq("campaign_id", campaign_id)
      .eq("statut", "draft");

    if (offersError) {
      throw new Error(`Error fetching offers: ${offersError.message}`);
    }

    if (!offers || offers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, failed: 0, message: "No draft offers to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;

    // Get base URL from environment or use default
    const baseUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://switchly.lovable.app";

    for (const offer of offers) {
      try {
        // Get user phone number
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("telephone, prenom")
          .eq("id", offer.user_id)
          .single();

        if (profileError || !profile?.telephone) {
          console.error(`No phone for user ${offer.user_id}`);
          failed++;
          continue;
        }

        // Format phone number
        let phone = profile.telephone.replace(/\s/g, "");
        if (phone.startsWith("0")) {
          phone = "+33" + phone.substring(1);
        } else if (!phone.startsWith("+")) {
          phone = "+33" + phone;
        }

        // Build offer URL with token
        const offerUrl = `${baseUrl}/mon-offre?token=${offer.offer_token}`;

        // SMS text as specified
        const message = `Bonne nouvelle ! Votre offre personnalisée est prête. Consultez-la ici : ${offerUrl}`;

        // Send SMS via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhoneNumber,
            Body: message,
          }),
        });

        const twilioResult = await twilioResponse.json();

        if (twilioResponse.ok) {
          // Update offer status
          await supabase
            .from("user_offers")
            .update({ statut: "envoyee" })
            .eq("id", offer.id);

          // Update campaign_users status
          await supabase
            .from("campaign_users")
            .update({ statut_dans_campagne: "offre_envoyee" })
            .eq("user_id", offer.user_id)
            .eq("campaign_id", campaign_id);

          // Log SMS
          await supabase.from("sms_logs").insert({
            user_id: offer.user_id,
            telephone: phone,
            message: message,
            type: "offre",
            statut: "envoye",
          });

          sent++;
          console.log(`SMS sent to ${phone}`);
        } else {
          console.error(`Twilio error for ${phone}:`, twilioResult);
          
          // Log failed SMS
          await supabase.from("sms_logs").insert({
            user_id: offer.user_id,
            telephone: phone,
            message: message,
            type: "offre",
            statut: "echec",
          });

          failed++;
        }
      } catch (err) {
        console.error(`Error processing offer ${offer.id}:`, err);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-campaign-offers-sms:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
