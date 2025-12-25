import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetCodeRequest {
  telephone: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telephone, code }: ResetCodeRequest = await req.json();

    console.log(`Sending reset code SMS to ${telephone}`);

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by phone number
    const cleanPhone = telephone.replace(/[^0-9]/g, "");
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, telephone")
      .or(`telephone.eq.${telephone},telephone.eq.0${cleanPhone},telephone.eq.+33${cleanPhone.substring(1)}`)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, message: "Erreur lors de la recherche du compte" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!profile) {
      console.log("No user found with this phone number");
      return new Response(
        JSON.stringify({ success: false, message: "Aucun compte trouvé" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get Twilio credentials from environment
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured");
      return new Response(
        JSON.stringify({ success: false, message: "SMS non configuré" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format phone number for Twilio
    let formattedPhone = telephone.replace(/\s/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+33" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const smsBody = `Switchly - Votre code de réinitialisation est : ${code}. Ce code expire dans 10 minutes.`;

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
        JSON.stringify({ success: false, message: "Erreur d'envoi SMS" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log the SMS
    await supabase.from("sms_logs").insert({
      user_id: profile.id,
      telephone: formattedPhone,
      message: smsBody,
      type: "reset_code",
      statut: "envoye",
    });

    console.log("Reset code SMS sent successfully:", twilioResult.sid);

    return new Response(
      JSON.stringify({ success: true, userId: profile.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-reset-code-sms function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
