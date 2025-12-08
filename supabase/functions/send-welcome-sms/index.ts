import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeSmsRequest {
  userId: string;
  telephone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, telephone }: WelcomeSmsRequest = await req.json();

    console.log(`Sending welcome SMS to ${telephone} for user ${userId}`);

    // Get Twilio credentials from environment
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

    // Get user's housing token from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("housing_token")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.housing_token) {
      console.error("Could not fetch housing token:", profileError);
      return new Response(
        JSON.stringify({ success: false, message: "Could not fetch user profile" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build the form URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://kaebtbcufbpkhyrhuson.lovable.app";
    const formUrl = `${baseUrl}/formulaire-logement/${profile.housing_token}`;

    // Format phone number for Twilio (add +33 if needed)
    let formattedPhone = telephone.replace(/\s/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+33" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const smsBody = `Switchly : merci pour votre inscription 🙌 Pour recevoir une offre adaptée à votre logement, merci de compléter ce court formulaire (30 sec) : ${formUrl}`;

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

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResult);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send SMS", error: twilioResult }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log the SMS
    await supabase.from("sms_logs").insert({
      user_id: userId,
      message: smsBody,
      statut: "envoye",
    });

    console.log("SMS sent successfully:", twilioResult.sid);

    return new Response(
      JSON.stringify({ success: true, messageSid: twilioResult.sid }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-welcome-sms function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
