import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { ville, code_postal } = await req.json();
    if (!ville) return new Response(JSON.stringify({ error: 'Ville requise' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY non configurée');

    const prompt = `Tu es un expert SEO spécialisé dans les comparateurs d'énergie en France.

Génère le contenu SEO pour la ville de ${ville}${code_postal ? ` (${code_postal})` : ''}.

Switchly est un COMPARATEUR GRATUIT d'électricité et de gaz. L'utilisateur entre son code postal, compare les offres en 30 secondes et choisit directement. Switchly est rémunéré par commission auprès des fournisseurs — totalement gratuit pour le consommateur.

INTERDIT de mentionner : achat groupé, négociation collective, rejoindre un groupe, inscription à un groupement, internet, box internet, fibre, ADSL, opérateur télécom.
OBLIGATOIRE de mentionner : comparer, comparateur, meilleures offres, changer de fournisseur, économiser, gratuit, sans engagement, électricité, gaz.

Génère un JSON valide :
{
  "titre": "Comparateur électricité et gaz à ${ville} — Économisez jusqu'à 300€/an",
  "meta_description": "Comparez gratuitement les offres électricité et gaz à ${ville}${code_postal ? ` (${code_postal})` : ''}. Sans engagement, sans coupure. Économisez jusqu'à 300€/an.",
  "contenu_hero": "2-3 phrases sur les économies possibles à ${ville} en comparant les offres énergie.",
  "contenu_principal": "HTML <p><h2><h3><ul><li>. 3-4 paragraphes : pourquoi comparer à ${ville}, comment fonctionne Switchly, économies possibles. Mentionner Enedis et GRDF.",
  "contenu_avantages": "HTML <ul><li> avec 5-6 avantages de comparer avec Switchly.",
  "contenu_cta": "1-2 phrases d'appel à l'action pour comparer gratuitement à ${ville}.",
  "mots_cles": ["comparateur électricité ${ville}", "comparateur gaz ${ville}", "meilleur fournisseur énergie ${ville}", "changer fournisseur ${ville}", "économiser facture énergie ${ville}"]
}

Règles :
- Le titre DOIT commencer par "Comparateur électricité et gaz à ${ville}"
- La meta_description DOIT mentionner "${ville}" et "gratuit"
- Ne jamais utiliser les mots : achat groupé, négociation, rejoindre, internet, fibre
- Retourne UNIQUEMENT le JSON, sans backticks.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'user', content: prompt }] }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Limite atteinte.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'Crédits insuffisants.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`Erreur AI: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error('Réponse AI vide');

    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
    const parsedContent = JSON.parse(cleanContent.trim());

    const slug = ville.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return new Response(
      JSON.stringify({ success: true, data: { ville, code_postal: code_postal || null, slug, ...parsedContent } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
