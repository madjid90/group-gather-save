import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 5;

interface VerifyCodeRequest {
  telephone: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telephone, code }: VerifyCodeRequest = await req.json();

    console.log(`Verifying reset code for ${telephone}`);

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

    // Get the reset attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("password_reset_attempts")
      .select("*")
      .eq("phone_number", normalizedPhone)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attemptError || !attempt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Code expiré ou invalide. Veuillez demander un nouveau code." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if blocked
    if (attempt.blocked_until && new Date(attempt.blocked_until) > new Date()) {
      const remainingSeconds = Math.ceil((new Date(attempt.blocked_until).getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ 
          success: false, 
          blocked: true,
          remainingSeconds,
          message: `Compte bloqué. Réessayez dans ${Math.ceil(remainingSeconds / 60)} minutes.` 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the code
    if (attempt.reset_code !== code) {
      const newAttempts = (attempt.attempts || 0) + 1;
      
      // Update attempts count
      const updateData: any = { attempts: newAttempts };
      
      // Block if max attempts reached
      if (newAttempts >= MAX_ATTEMPTS) {
        updateData.blocked_until = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000).toISOString();
      }

      await supabase
        .from("password_reset_attempts")
        .update(updateData)
        .eq("id", attempt.id);

      if (newAttempts >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            blocked: true,
            remainingSeconds: BLOCK_DURATION_MINUTES * 60,
            message: `Trop de tentatives. Compte bloqué pendant ${BLOCK_DURATION_MINUTES} minutes.` 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          attemptsRemaining: MAX_ATTEMPTS - newAttempts,
          message: `Code incorrect. ${MAX_ATTEMPTS - newAttempts} tentative(s) restante(s).` 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Code is correct - generate a reset token for password update
    const resetToken = crypto.randomUUID();
    
    await supabase
      .from("password_reset_attempts")
      .update({ 
        reset_code: resetToken, // Replace code with token for security
        attempts: 0,
      })
      .eq("id", attempt.id);

    // Get user ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .or(`telephone.eq.${telephone},telephone.eq.0${cleanPhone},telephone.eq.+33${cleanPhone.substring(1)}`)
      .maybeSingle();

    console.log("Code verified successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        resetToken,
        userId: profile?.id,
        message: "Code vérifié avec succès" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in verify-reset-code function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
