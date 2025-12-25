import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 5;

interface ResetCodeRequest {
  telephone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telephone }: ResetCodeRequest = await req.json();

    console.log(`Processing reset code request for ${telephone}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize phone number
    const cleanPhone = telephone.replace(/[^0-9]/g, "");
    const normalizedPhone = cleanPhone.startsWith("33") 
      ? "0" + cleanPhone.substring(2) 
      : cleanPhone.startsWith("0") 
        ? cleanPhone 
        : "0" + cleanPhone;

    // Find user by phone number
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

    // Check for existing valid reset attempt
    const { data: existingAttempt } = await supabase
      .from("password_reset_attempts")
      .select("*")
      .eq("phone_number", normalizedPhone)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check if blocked
    if (existingAttempt?.blocked_until && new Date(existingAttempt.blocked_until) > new Date()) {
      const remainingSeconds = Math.ceil((new Date(existingAttempt.blocked_until).getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ 
          success: false, 
          blocked: true,
          remainingSeconds,
          message: `Trop de tentatives. Réessayez dans ${Math.ceil(remainingSeconds / 60)} minutes.` 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check cooldown for resending
    if (existingAttempt?.last_sms_sent_at) {
      const lastSent = new Date(existingAttempt.last_sms_sent_at);
      const secondsSinceLastSms = (Date.now() - lastSent.getTime()) / 1000;
      
      if (secondsSinceLastSms < RESEND_COOLDOWN_SECONDS) {
        const remainingCooldown = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSms);
        return new Response(
          JSON.stringify({ 
            success: false, 
            cooldown: true,
            remainingCooldown,
            message: `Veuillez patienter ${remainingCooldown} secondes avant de renvoyer un code.` 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Generate new 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create or update reset attempt record
    if (existingAttempt) {
      await supabase
        .from("password_reset_attempts")
        .update({
          reset_code: resetCode,
          last_sms_sent_at: new Date().toISOString(),
          attempts: 0, // Reset attempts on new code
          blocked_until: null,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        })
        .eq("id", existingAttempt.id);
    } else {
      await supabase
        .from("password_reset_attempts")
        .insert({
          phone_number: normalizedPhone,
          reset_code: resetCode,
          attempts: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
    }

    // Get Twilio credentials
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

    // Format phone for Twilio
    let formattedPhone = telephone.replace(/\s/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+33" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Send SMS
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const smsBody = `Switchly - Votre code de réinitialisation est : ${resetCode}. Ce code expire dans 10 minutes.`;

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

    // Log SMS
    await supabase.from("sms_logs").insert({
      user_id: profile.id,
      telephone: formattedPhone,
      message: smsBody,
      type: "reset_code",
      statut: "envoye",
    });

    console.log("Reset code SMS sent successfully:", twilioResult.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: profile.id,
        cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      }),
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
