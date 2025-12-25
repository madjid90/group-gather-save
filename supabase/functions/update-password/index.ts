import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePasswordRequest {
  userId: string;
  newPassword: string;
  resetToken: string;
  telephone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, newPassword, resetToken, telephone }: UpdatePasswordRequest = await req.json();

    console.log(`Updating password for user ${userId}`);

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Normalize phone number
    const cleanPhone = telephone.replace(/[^0-9]/g, "");
    const normalizedPhone = cleanPhone.startsWith("33") 
      ? "0" + cleanPhone.substring(2) 
      : cleanPhone.startsWith("0") 
        ? cleanPhone 
        : "0" + cleanPhone;

    // Verify the reset token is valid
    const { data: attempt, error: attemptError } = await supabase
      .from("password_reset_attempts")
      .select("*")
      .eq("phone_number", normalizedPhone)
      .eq("reset_code", resetToken)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (attemptError || !attempt) {
      console.error("Invalid or expired reset token");
      return new Response(
        JSON.stringify({ success: false, message: "Session expirée. Veuillez recommencer." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ success: false, message: "Erreur lors de la mise à jour du mot de passe" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark the reset attempt as used
    await supabase
      .from("password_reset_attempts")
      .update({ used: true })
      .eq("id", attempt.id);

    console.log("Password updated successfully for user:", userId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in update-password function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
