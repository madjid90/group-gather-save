import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RelanceSmsRequest {
  type: "relance_formulaire_24h" | "relance_formulaire_j3" | "relance_offre_48h" | "debut_negociation" | "fin_campagne";
  campaign_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, campaign_id }: RelanceSmsRequest = await req.json();

    console.log(`Processing relance SMS type: ${type}`);

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Twilio not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const baseUrl = Deno.env.get("SITE_URL") || "https://kaebtbcufbpkhyrhuson.lovable.app";

    let users: any[] = [];
    let messageTemplate = "";

    switch (type) {
      case "relance_formulaire_24h":
      case "relance_formulaire_j3": {
        // Get users who haven't completed their housing form
        const hoursAgo = type === "relance_formulaire_24h" ? 24 : 72;
        const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
        
        const { data } = await supabase
          .from("profiles")
          .select("id, telephone, housing_token, prenom")
          .eq("housing_form_completed", false)
          .lt("created_at", cutoffDate)
          .not("telephone", "is", null);

        users = data || [];
        messageTemplate = "Switchly : n'oubliez pas de compléter votre profil logement pour recevoir votre offre personnalisée ! {{link}}";
        break;
      }

      case "debut_negociation": {
        if (!campaign_id) {
          return new Response(
            JSON.stringify({ success: false, message: "campaign_id required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const { data } = await supabase
          .from("campaign_users")
          .select("user_id, profiles(telephone, prenom)")
          .eq("campaign_id", campaign_id);

        users = (data || []).map((cu: any) => ({
          id: cu.user_id,
          telephone: cu.profiles?.telephone,
          prenom: cu.profiles?.prenom,
        }));
        messageTemplate = "Switchly : bonne nouvelle ! La négociation avec les fournisseurs a commencé. Vous recevrez bientôt votre offre personnalisée 🎉";
        break;
      }

      case "relance_offre_48h": {
        if (!campaign_id) {
          return new Response(
            JSON.stringify({ success: false, message: "campaign_id required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Get users with offers sent but no response after 48h
        const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        
        const { data: offers } = await supabase
          .from("user_offers")
          .select("user_id, offer_token, updated_at")
          .eq("campaign_id", campaign_id)
          .eq("statut", "envoyee")
          .lt("updated_at", cutoffDate);

        if (offers && offers.length > 0) {
          const userIds = offers.map((o: any) => o.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, telephone, prenom")
            .in("id", userIds);

          users = (profiles || []).map((p: any) => {
            const offer = offers.find((o: any) => o.user_id === p.id);
            return {
              ...p,
              offer_token: offer?.offer_token,
            };
          });
        }
        messageTemplate = "Switchly : votre offre personnalisée vous attend ! Ne passez pas à côté de vos économies 💰 {{link}}";
        break;
      }

      case "fin_campagne": {
        if (!campaign_id) {
          return new Response(
            JSON.stringify({ success: false, message: "campaign_id required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const { data } = await supabase
          .from("campaign_users")
          .select("user_id, profiles(telephone, prenom)")
          .eq("campaign_id", campaign_id);

        users = (data || []).map((cu: any) => ({
          id: cu.user_id,
          telephone: cu.profiles?.telephone,
          prenom: cu.profiles?.prenom,
        }));
        messageTemplate = "Switchly : la campagne est terminée. Merci pour votre participation ! Rendez-vous pour la prochaine campagne 🙏";
        break;
      }
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      if (!user.telephone) continue;

      let formattedPhone = user.telephone.replace(/\s/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+33" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }

      let message = messageTemplate;
      
      // Add links where needed
      if (type.startsWith("relance_formulaire") && user.housing_token) {
        const link = `${baseUrl}/formulaire-logement/${user.housing_token}`;
        message = message.replace("{{link}}", link);
      } else if (type === "relance_offre_48h" && user.offer_token) {
        const link = `${baseUrl}/mon-offre?token=${user.offer_token}`;
        message = message.replace("{{link}}", link);
      } else {
        message = message.replace(" {{link}}", "");
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
            Body: message,
          }),
        });

        if (twilioResponse.ok) {
          await supabase.from("sms_logs").insert({
            user_id: user.id,
            telephone: formattedPhone,
            message: message,
            type: type,
            statut: "envoye",
          });
          sentCount++;
        } else {
          failedCount++;
          console.error("Twilio error for user:", user.id);
        }
      } catch (error) {
        failedCount++;
        console.error("Error sending SMS to user:", user.id, error);
      }
    }

    console.log(`Relance SMS completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        total: users.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-relance-sms function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);