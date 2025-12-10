import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NegotiationStartRequest {
  campaignId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId }: NegotiationStartRequest = await req.json();

    console.log(`Sending negotiation start SMS for campaign ${campaignId}`);

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured, skipping SMS");
      return new Response(
        JSON.stringify({ success: false, message: "Twilio not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users in the campaign
    const { data: campaignUsers, error: usersError } = await supabase
      .from("campaign_users")
      .select("user_id")
      .eq("campaign_id", campaignId);

    if (usersError) throw usersError;

    if (!campaignUsers || campaignUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No users in campaign" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SMS text as specified
    const smsBody = `La négociation avec les fournisseurs commence ! Nous revenons vers vous dès que l'offre est disponible.`;

    let sent = 0;
    let failed = 0;

    for (const cu of campaignUsers) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("telephone")
        .eq("id", cu.user_id)
        .single();

      if (!profile?.telephone) {
        failed++;
        continue;
      }

      let formattedPhone = profile.telephone.replace(/\s/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+33" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formattedPhone,
            From: twilioPhoneNumber,
            Body: smsBody,
          }),
        });

        if (twilioResponse.ok) {
          sent++;
          await supabase.from("sms_logs").insert({
            user_id: cu.user_id,
            telephone: formattedPhone,
            message: smsBody,
            type: "negotiation_start",
            statut: "envoye",
          });
        } else {
          failed++;
          await supabase.from("sms_logs").insert({
            user_id: cu.user_id,
            telephone: formattedPhone,
            message: smsBody,
            type: "negotiation_start",
            statut: "echec",
          });
        }
      } catch (e) {
        console.error(`Error sending to ${cu.user_id}:`, e);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-negotiation-start-sms function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
