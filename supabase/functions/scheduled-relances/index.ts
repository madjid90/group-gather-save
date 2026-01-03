import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Scheduled relances - runs automatically via cron to send reminder SMS
 * 
 * Types of reminders:
 * - relance_formulaire_24h: 24h after registration, form not completed
 * - relance_formulaire_j3: 3 days after registration, form not completed  
 * - relance_offre_48h: 48h after offer sent, no response
 */
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting scheduled relances check...");

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured, skipping relances");
      return new Response(
        JSON.stringify({ success: false, message: "Twilio not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const baseUrl = Deno.env.get("SITE_URL") || "https://switchly.fr";

    const results = {
      relance_formulaire_24h: { sent: 0, failed: 0 },
      relance_formulaire_j3: { sent: 0, failed: 0 },
      relance_offre_48h: { sent: 0, failed: 0 },
    };

    // Helper to send SMS
    async function sendSms(
      userId: string,
      phone: string,
      message: string,
      type: string
    ): Promise<boolean> {
      let formattedPhone = phone.replace(/\s/g, "");
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
            From: twilioPhoneNumber!,
            Body: message,
          }),
        });

        if (twilioResponse.ok) {
          await supabase.from("sms_logs").insert({
            user_id: userId,
            telephone: formattedPhone,
            message: message,
            type: type,
            statut: "envoye",
          });
          console.log(`SMS sent to ${formattedPhone} (${type})`);
          return true;
        } else {
          const errorResult = await twilioResponse.json();
          console.error(`Twilio error for ${type}:`, errorResult);
          return false;
        }
      } catch (error) {
        console.error(`Error sending SMS (${type}):`, error);
        return false;
      }
    }

    // ============================================
    // 1. Relance formulaire 24h
    // ============================================
    console.log("Checking relance_formulaire_24h...");
    {
      const minHours = 23;
      const maxHours = 25;
      const minDate = new Date(Date.now() - maxHours * 60 * 60 * 1000).toISOString();
      const maxDate = new Date(Date.now() - minHours * 60 * 60 * 1000).toISOString();
      
      const { data: alreadySent } = await supabase
        .from("sms_logs")
        .select("user_id")
        .eq("type", "relance_formulaire_24h");
      
      const alreadySentUserIds = (alreadySent || []).map((s) => s.user_id);
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, telephone, housing_token, prenom")
        .eq("housing_form_completed", false)
        .gte("created_at", minDate)
        .lte("created_at", maxDate)
        .not("telephone", "is", null);
      
      const users = (profiles || []).filter((u) => !alreadySentUserIds.includes(u.id));
      
      for (const user of users) {
        if (!user.telephone || !user.housing_token) continue;
        const link = `${baseUrl}/formulaire-logement/${user.housing_token}`;
        const message = `Switchly : n'oubliez pas de compléter votre profil logement pour recevoir votre offre personnalisée ! ${link}`;
        
        const success = await sendSms(user.id, user.telephone, message, "relance_formulaire_24h");
        if (success) results.relance_formulaire_24h.sent++;
        else results.relance_formulaire_24h.failed++;
      }
    }

    // ============================================
    // 2. Relance formulaire J3
    // ============================================
    console.log("Checking relance_formulaire_j3...");
    {
      const minHours = 71;
      const maxHours = 73;
      const minDate = new Date(Date.now() - maxHours * 60 * 60 * 1000).toISOString();
      const maxDate = new Date(Date.now() - minHours * 60 * 60 * 1000).toISOString();
      
      const { data: alreadySent } = await supabase
        .from("sms_logs")
        .select("user_id")
        .eq("type", "relance_formulaire_j3");
      
      const alreadySentUserIds = (alreadySent || []).map((s) => s.user_id);
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, telephone, housing_token, prenom")
        .eq("housing_form_completed", false)
        .gte("created_at", minDate)
        .lte("created_at", maxDate)
        .not("telephone", "is", null);
      
      const users = (profiles || []).filter((u) => !alreadySentUserIds.includes(u.id));
      
      for (const user of users) {
        if (!user.telephone || !user.housing_token) continue;
        const link = `${baseUrl}/formulaire-logement/${user.housing_token}`;
        const message = `Switchly : dernière relance ! Complétez votre profil en 2 min pour ne pas rater votre offre personnalisée 🔔 ${link}`;
        
        const success = await sendSms(user.id, user.telephone, message, "relance_formulaire_j3");
        if (success) results.relance_formulaire_j3.sent++;
        else results.relance_formulaire_j3.failed++;
      }
    }

    // ============================================
    // 3. Relance offre 48h (AUTOMATIQUE)
    // ============================================
    console.log("Checking relance_offre_48h...");
    {
      const minHours = 47;
      const maxHours = 49;
      const minDate = new Date(Date.now() - maxHours * 60 * 60 * 1000).toISOString();
      const maxDate = new Date(Date.now() - minHours * 60 * 60 * 1000).toISOString();
      
      // Get users who haven't received this SMS type yet
      const { data: alreadySent } = await supabase
        .from("sms_logs")
        .select("user_id")
        .eq("type", "relance_offre_48h");
      
      const alreadySentUserIds = (alreadySent || []).map((s) => s.user_id);
      
      // Get offers sent 47-49h ago with status "envoyee" (not viewed/responded)
      const { data: offers } = await supabase
        .from("user_offers")
        .select("user_id, offer_token, updated_at")
        .eq("statut", "envoyee")
        .gte("updated_at", minDate)
        .lte("updated_at", maxDate);

      if (offers && offers.length > 0) {
        const userIds = offers
          .map((o) => o.user_id)
          .filter((id) => !alreadySentUserIds.includes(id));
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, telephone, prenom")
            .in("id", userIds);

          for (const profile of profiles || []) {
            if (!profile.telephone) continue;
            
            const offer = offers.find((o) => o.user_id === profile.id);
            if (!offer?.offer_token) continue;
            
            const link = `${baseUrl}/mon-offre/${offer.offer_token}`;
            const message = `Switchly : votre offre personnalisée vous attend ! Ne passez pas à côté de vos économies 💰 ${link}`;
            
            const success = await sendSms(profile.id, profile.telephone, message, "relance_offre_48h");
            if (success) results.relance_offre_48h.sent++;
            else results.relance_offre_48h.failed++;
          }
        }
      }
    }

    console.log("Scheduled relances completed:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in scheduled-relances function:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
