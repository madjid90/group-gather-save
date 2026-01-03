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

    const prompt = `Tu es un expert en rédaction SEO pour un service d'achat groupé d'énergie et d'internet en France.

Génère le contenu pour une page SEO locale pour la ville de ${ville}${code_postal ? ` (${code_postal})` : ''}.

Le service proposé est Switchly, une plateforme d'achat groupé qui permet aux habitants de ${ville} de réduire leurs factures de ${serviceLabel} en négociant collectivement avec les fournisseurs.

Génère un JSON avec la structure suivante:
{
  "titre": "Titre H1 optimisé SEO (max 60 caractères)",
  "meta_description": "Meta description optimisée (max 155 caractères)",
  "contenu_hero": "Texte accrocheur pour la section hero (2-3 phrases)",
  "contenu_principal": "Contenu principal détaillé en HTML (3-4 paragraphes avec des <p>, <h2>, <h3>, <ul>, <li>)",
  "contenu_avantages": "Liste des avantages locaux en HTML (utilise <ul><li>)",
  "contenu_cta": "Texte d'appel à l'action personnalisé (1-2 phrases)",
  "mots_cles": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"]
}

Règles:
- Utilise le nom de la ville naturellement dans le contenu
- Mentionne des éléments locaux crédibles (région, département)
- Optimise pour les recherches "achat groupé énergie ${ville}", "économie électricité ${ville}"
- Ton professionnel mais accessible
- Contenu unique et engageant
- N'invente pas de statistiques locales spécifiques fausses

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

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
