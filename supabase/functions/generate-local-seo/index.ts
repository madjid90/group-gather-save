import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ville, code_postal, service_type } = await req.json();
    
    if (!ville) {
      return new Response(
        JSON.stringify({ error: 'Ville requise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const serviceLabel = service_type === 'energie' ? "l'énergie" : 
                         service_type === 'internet' ? "l'internet" : 
                         "l'énergie et l'internet";

    const prompt = `Tu es un expert SEO spécialisé dans les comparateurs d'énergie et d'internet en France.

Génère le contenu SEO pour la ville de ${ville}${code_postal ? ` (${code_postal})` : ''}.

Switchly est un COMPARATEUR GRATUIT d'électricité, gaz et internet. L'utilisateur entre son code postal, compare les offres en 30 secondes et choisit directement. Switchly est rémunéré par commission auprès des fournisseurs — totalement gratuit pour le consommateur.

INTERDIT de mentionner : achat groupé, négociation collective, rejoindre un groupe, inscription à un groupement.
OBLIGATOIRE de mentionner : comparer, comparateur, meilleures offres, changer de fournisseur, économiser, gratuit, sans engagement.

Génère un JSON valide avec cette structure exacte :
{
  "titre": "Comparateur énergie et internet à ${ville} — Économisez jusqu'à 400€/an",
  "meta_description": "Comparez gratuitement les offres électricité, gaz et internet à ${ville}${code_postal ? ` (${code_postal})` : ''}. Sans engagement, sans coupure. Économisez jusqu'à 400€/an en changeant de fournisseur.",
  "contenu_hero": "2-3 phrases accrocheuses sur les économies possibles à ${ville} en comparant les offres énergie et internet. Insister sur : gratuit, 30 secondes, sans engagement, sans coupure.",
  "contenu_principal": "HTML avec <p><h2><h3><ul><li>. 3-4 paragraphes expliquant : pourquoi comparer à ${ville}, comment fonctionne Switchly (gratuit, 30 secondes, sans coupure), économies possibles selon le type de logement. Mentionner Enedis pour l'électricité, GRDF pour le gaz.",
  "contenu_avantages": "HTML <ul><li> avec 5-6 avantages de comparer avec Switchly : 100% gratuit, sans engagement, sans coupure, résultat en 30 secondes, toutes les offres du marché, accompagnement si besoin.",
  "contenu_cta": "1-2 phrases d'appel à l'action pour comparer gratuitement les offres à ${ville} maintenant.",
  "mots_cles": ["comparateur énergie ${ville}", "comparer électricité ${ville}", "meilleur fournisseur gaz ${ville}", "changer fournisseur énergie ${ville}", "économiser facture énergie ${ville}"]
}

Règles absolues :
- Le titre DOIT commencer exactement par "Comparateur énergie et internet à ${ville}"
- La meta_description DOIT mentionner "${ville}" et "gratuit"
- Ne jamais utiliser les mots : achat groupé, négociation, rejoindre, s'inscrire au groupement
- Utiliser le nom de la ville naturellement dans tout le contenu
- Mentionner le département ou la région pour le contexte local
- Ne pas inventer de statistiques locales précises fausses
- Le JSON doit être valide et parseable directement

Retourne UNIQUEMENT le JSON, sans texte avant ou après, sans backticks markdown.`;

    console.log('Génération de contenu SEO pour:', ville);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, réessayez plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Erreur AI Gateway:', response.status, errorText);
      throw new Error(`Erreur AI: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Réponse AI vide');
    }

    // Parse le JSON de la réponse
    let parsedContent;
    try {
      // Nettoyer la réponse si elle contient des backticks markdown
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      parsedContent = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError, 'Content:', content);
      throw new Error('Format de réponse AI invalide');
    }

    // Générer le slug
    const slug = ville
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const result = {
      ville,
      code_postal: code_postal || null,
      slug,
      ...parsedContent
    };

    console.log('Contenu SEO généré avec succès pour:', ville);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur generate-local-seo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
