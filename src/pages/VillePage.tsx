import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Leaf, Star, ChevronRight, Users, Zap, Globe, Phone } from 'lucide-react';

interface Ville {
  slug: string; nom: string; code_postal: string; code_insee: string;
  departement: string | null; region: string | null; population: number | null;
  nb_logements_elec: number | null; nb_logements_gaz: number | null;
  conso_moyenne_kwh: number | null; conso_gaz_kwh: number | null;
  reseau_elec: string | null; reseau_gaz: string | null; nom_eld: string | null;
  prix_trv_kwh: number | null;
  statut_publication: string | null;
  contenu_elec_intro: string | null; contenu_elec_contexte: string | null; contenu_elec_conseils: string | null;
  contenu_elec_meta: string | null;
  contenu_gaz_intro: string | null; contenu_gaz_contexte: string | null; contenu_gaz_conseils: string | null;
  contenu_gaz_meta: string | null;
}

interface Offre {
  id: string; fournisseur: string; nom_offre: string; type: string;
  prix_kwh: number; abonnement_annuel: number; label_vert: boolean; url_souscription: string;
}

const LOGEMENTS = [
  { label: 'Studio (<30m²)', conso: 1500 },
  { label: 'Appart (30-50m²)', conso: 2500 },
  { label: 'Appart (50-75m²)', conso: 3800 },
  { label: 'Maison (75-100m²)', conso: 5200 },
  { label: 'Maison (100-150m²)', conso: 7000 },
  { label: 'Grande (>150m²)', conso: 10500 },
];

function VillePageSkeleton() {
  return (
    <div className="bg-muted/20">
      <section className="pt-10 pb-8 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto rounded-xl" />
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl space-y-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function VillePage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const isElec = !location.pathname.startsWith('/gaz/');
  const type = isElec ? 'electricite' : 'gaz';

  const label = isElec ? 'électricité' : 'gaz naturel';
  const labelCourt = isElec ? 'électricité' : 'gaz';
  const labelCap = isElec ? 'Électricité' : 'Gaz';
  const emoji = isElec ? '⚡' : '🔥';
  const alt_type = isElec ? 'gaz' : 'electricite';
  const alt_label = isElec ? 'gaz' : 'électricité';

  const [ville, setVille] = useState<Ville | null>(null);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [villesProches, setVillesProches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tarifs, setTarifs] = useState({ trv_elec: 0.2516, trv_gaz: 0.1244, abo_elec: 150, abo_gaz: 230 });

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);

      // Fetch tarifs + ville in parallel
      const [villeRes, tarifsRes] = await Promise.all([
        (supabase.from('villes') as any).select('*').eq('slug', slug).single(),
        (supabase.from('tarifs_energie') as any).select('trv_elec_kwh, trv_gaz_kwh, trv_elec_abo_annuel, trv_gaz_abo_annuel').eq('id', 'current').single(),
      ]);

      if (villeRes.error || !villeRes.data) { setNotFound(true); setLoading(false); return; }
      const v = villeRes.data as Ville;
      setVille(v);

      if (tarifsRes.data) {
        setTarifs({
          trv_elec: tarifsRes.data.trv_elec_kwh || 0.2516,
          trv_gaz: tarifsRes.data.trv_gaz_kwh || 0.1244,
          abo_elec: tarifsRes.data.trv_elec_abo_annuel || 150,
          abo_gaz: tarifsRes.data.trv_gaz_abo_annuel || 230,
        });
      }

      const [offresRes, prochesRes] = await Promise.all([
        supabase.functions.invoke('selectra-offers', { body: { type, code_postal: v.code_postal } }),
        (supabase.from('villes') as any)
          .select('slug, nom, code_postal, population')
          .eq('departement', v.departement)
          .neq('slug', slug)
          .order('population', { ascending: false })
          .limit(6),
      ]);
      if (offresRes.data?.offres) setOffres(offresRes.data.offres);
      if (prochesRes.data) setVillesProches(prochesRes.data);
      setLoading(false);
    };
    fetchData();
  }, [slug, type]);

  if (loading) return <VillePageSkeleton />;

  if (notFound || !ville) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <h1 className="text-2xl font-bold">Commune non trouvée</h1>
        <p className="text-muted-foreground">Cette page n'existe pas encore.</p>
        <Button asChild><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }

  // Bloquer les pages non publiées (sauf admin en preview)
  const isPreview = window.location.search.includes('preview=admin');
  if (!isPreview && ville.statut_publication && ville.statut_publication !== 'publiee') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <h1 className="text-2xl font-bold">Page en cours de validation</h1>
        <p className="text-muted-foreground">Cette page sera bientôt disponible.</p>
        <Button asChild><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }

  const prix_ref = isElec ? tarifs.trv_elec : tarifs.trv_gaz;
  const ref_abo = isElec ? tarifs.abo_elec : tarifs.abo_gaz;
  const ref_label = isElec ? 'tarif réglementé EDF' : 'tarif repère gaz';

  const conso = isElec ? (ville.conso_moyenne_kwh || 4800) : (ville.conso_gaz_kwh || 11000);
  const reseau = isElec ? (ville.reseau_elec || 'Enedis') : (ville.reseau_gaz || 'GRDF');
  const nb_foyers = isElec ? ville.nb_logements_elec : ville.nb_logements_gaz;
  const econoMax = offres[0] ? Math.round((prix_ref - offres[0].prix_kwh) * conso) : isElec ? 300 : 150;
  const comparerUrl = `/comparer?cp=${ville.code_postal}&type=${type}&ville=${encodeURIComponent(ville.nom)}`;
  const abo = offres[0]?.abonnement_annuel || 149;

  const contenu_intro = isElec ? ville.contenu_elec_intro : ville.contenu_gaz_intro;
  const contenu_contexte = isElec ? ville.contenu_elec_contexte : ville.contenu_gaz_contexte;
  const contenu_conseils = isElec ? ville.contenu_elec_conseils : ville.contenu_gaz_conseils;
  const metaIA = isElec ? ville.contenu_elec_meta : ville.contenu_gaz_meta;

  const metaDescription = metaIA || `Comparez les offres ${label} à ${ville.nom} (${ville.code_postal}). ${ville.population?.toLocaleString('fr-FR') || ''} habitants. Économisez jusqu'à ${econoMax}€/an. Réseau ${reseau}. Gratuit, sans engagement.`;

  // Schema.org
  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `Quel est le meilleur fournisseur ${label} à ${ville.nom} en 2026 ?`, "acceptedAnswer": { "@type": "Answer", "text": `En 2026 à ${ville.nom}, l'offre ${offres[0]?.nom_offre || 'Extra Eco'} de ${offres[0]?.fournisseur || 'OHM Énergie'} est la plus compétitive. Pour ${conso.toLocaleString('fr-FR')} kWh/an, vous économisez jusqu'à ${econoMax}€/an par rapport au ${ref_label}.` } },
      { "@type": "Question", "name": `Comment changer de fournisseur ${labelCourt} à ${ville.nom} ?`, "acceptedAnswer": { "@type": "Answer", "text": `Changer de fournisseur ${labelCourt} à ${ville.nom} est gratuit, sans coupure et 100% en ligne. Le réseau ${reseau} continue à gérer la distribution. Comptez 21 jours maximum.` } },
      { "@type": "Question", "name": `Y a-t-il une coupure lors du changement à ${ville.nom} ?`, "acceptedAnswer": { "@type": "Answer", "text": `Non, aucune coupure. La distribution est assurée par ${reseau} quel que soit votre fournisseur.` } },
      { "@type": "Question", "name": `Puis-je changer si je suis locataire à ${ville.nom} ?`, "acceptedAnswer": { "@type": "Answer", "text": `Oui. Propriétaires et locataires peuvent librement choisir leur fournisseur. Aucune autorisation du propriétaire n'est requise.` } },
      { "@type": "Question", "name": `Combien coûte le changement de fournisseur à ${ville.nom} ?`, "acceptedAnswer": { "@type": "Answer", "text": `Totalement gratuit. Aucun frais de résiliation ni de mise en service. Switchly est 100% gratuit.` } },
      { "@type": "Question", "name": `Qui gère le réseau ${labelCourt} à ${ville.nom} ?`, "acceptedAnswer": { "@type": "Answer", "text": ville.nom_eld ? `${ville.nom} est desservi par ${ville.nom_eld}, une ELD.` : `Le réseau est géré par ${reseau}.` } },
    ]
  };
  const schemaService = {
    "@context": "https://schema.org", "@type": "Service",
    "name": `Comparateur ${label} ${ville.nom}`,
    "description": `Comparez les offres ${label} à ${ville.nom}. Économisez jusqu'à ${econoMax}€/an.`,
    "provider": { "@type": "Organization", "name": "Switchly", "url": "https://switchly.fr", "telephone": "0973727300" },
    "areaServed": { "@type": "City", "name": ville.nom, "postalCode": ville.code_postal },
    "serviceType": `Comparateur ${label}`,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
  };
  const schemaBreadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://switchly.fr/" },
      { "@type": "ListItem", "position": 2, "name": labelCap, "item": `https://switchly.fr/${type}/` },
      { "@type": "ListItem", "position": 3, "name": ville.departement, "item": `https://switchly.fr/${type}/departement/${ville.departement?.toLowerCase().replace(/\s+/g,'-')}` },
      { "@type": "ListItem", "position": 4, "name": ville.nom, "item": `https://switchly.fr/${type}/${ville.slug}` },
    ]
  };

  return (
    <>
      <Helmet>
        <title>Comparateur {label} {ville.nom} ({ville.code_postal}) — Meilleure offre 2026</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://switchly.fr/${type}/${ville.slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaService)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
      </Helmet>

      <div className="bg-muted/20">
        {/* Sticky phone */}
        <div className="sticky top-16 z-20 bg-[hsl(145,58%,30%)] text-white py-2 text-center text-sm">
          <a href="tel:0973727300" className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="font-semibold">09 73 72 73 00</span>
            <span className="hidden sm:inline">· Conseiller disponible · Gratuit · Lun-Ven 7h-21h</span>
          </a>
        </div>

        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-2.5">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              <Link to="/" className="hover:text-primary">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/${type}`} className="hover:text-primary">{labelCap}</Link>
              {ville.departement && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span>{ville.departement}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{ville.nom}</span>
            </nav>
          </div>
        </div>

        {/* HERO */}
        <section className="pt-10 pb-8 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">
              Comparateur {label} {ville.nom} ({ville.code_postal})
            </h1>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Économisez jusqu'à <span className="font-bold text-secondary">{econoMax}€/an</span> sur votre facture {labelCourt}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Aussi disponible : <Link to={`/${alt_type}/${ville.slug}`} className="text-primary hover:underline">Offres {alt_label} à {ville.nom}</Link>
            </p>
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
              <span className="text-sm text-muted-foreground">Code postal : <strong>{ville.code_postal}</strong></span>
              <Button size="sm" asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to={comparerUrl}>Comparer gratuitement →</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-muted-foreground">
              {['✅ Gratuit', '🔒 Sans engagement', `${emoji} Sans coupure`, '⏱ 30 secondes'].map(b => (
                <span key={b} className="font-medium">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CHIFFRES CLÉS */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Users, label: 'Habitants', value: ville.population?.toLocaleString('fr-FR') || 'N/A' },
                { icon: Zap, label: 'Conso moyenne', value: `${conso.toLocaleString('fr-FR')} kWh/an` },
                { icon: Globe, label: 'Réseau', value: `${reseau}${isElec && ville.nom_eld ? ` (${ville.nom_eld})` : ''}` },
              ].map(c => (
                <div key={c.label} className="bg-card border border-border rounded-2xl p-5 text-center">
                  <c.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Source : Enedis Open Data 2023</p>
          </div>
        </section>

        {/* INTRO SEO */}
        {(contenu_intro || contenu_contexte) && (
          <section className="py-8 bg-card">
            <div className="container mx-auto px-4 max-w-2xl prose prose-sm">
              {contenu_intro && <p>{contenu_intro}</p>}
              {contenu_contexte && <p className="mt-4">{contenu_contexte}</p>}
            </div>
          </section>
        )}

        {/* OFFRES */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-1">
              Meilleures offres {label} à {ville.nom} en 2026
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Triées par économies · Données actualisées en temps réel</p>

            <div className="space-y-3">
              {offres.slice(0, 5).map((o, i) => {
                const eco = Math.round((prix_ref - o.prix_kwh) * conso);
                const prix = Math.round(o.prix_kwh * conso + o.abonnement_annuel);
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-card border rounded-2xl p-5 ${i === 0 ? 'border-secondary shadow-md' : 'border-border'}`}
                  >
                    {i === 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-secondary mb-2">
                        <Star className="w-3 h-3 fill-secondary" /> Meilleure offre
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{o.fournisseur}</p>
                        <p className="text-sm text-muted-foreground">{o.nom_offre}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {o.label_vert && (
                            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Leaf className="w-3 h-3" /> Vert
                            </span>
                          )}
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Prix {o.type}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold">{prix}€<span className="text-sm font-normal text-muted-foreground">/an</span></p>
                        {eco > 0 && <p className="text-sm font-semibold text-secondary">+{eco}€/an</p>}
                        <p className="text-xs text-muted-foreground">vs {ref_label}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {o.prix_kwh.toFixed(4)} €/kWh · Abo {o.abonnement_annuel}€/an
                    </div>
                    <Button
                      className={`w-full mt-4 ${i === 0 ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : ''}`}
                      variant={i === 0 ? 'default' : 'outline'}
                      asChild
                    >
                      <a href={o.url_souscription} target="_blank" rel="noopener noreferrer">
                        Souscrire en ligne <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">Sans engagement · 21 jours max · 100% en ligne</p>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Prix calculés pour {conso.toLocaleString('fr-FR')} kWh/an (moyenne à {ville.nom}). Tarifs indicatifs non contractuels. Mis à jour le {new Date().toLocaleDateString('fr-FR')}.
            </p>
          </div>
        </section>

        {/* Selectra phone CTA */}
        <div className="container mx-auto px-4 max-w-2xl py-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold mb-1">Vous hésitez entre les offres ?</p>
            <p className="text-xs text-muted-foreground mb-3">Nos conseillers vous aident à choisir en moins de 5 minutes</p>
            <a href="tel:0973727300" className="inline-flex items-center gap-2 text-secondary font-bold text-lg">
              <Phone className="w-5 h-5" /> 09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground mt-1">Lun-Ven 7h-21h · Sam 8h30-18h30 · Dim 9h-17h30</p>
          </div>
        </div>

        {/* Comment changer */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl font-bold mb-6">Comment changer de fournisseur {labelCourt} à {ville.nom} ?</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: '🔍', step: 'Étape 1', title: 'Comparer', desc: `Entrez votre code postal ${ville.code_postal} et votre consommation. Switchly affiche toutes les offres disponibles à ${ville.nom}.` },
                { icon: '✅', step: 'Étape 2', title: 'Choisir', desc: 'Sélectionnez l\'offre adaptée : prix fixe ou variable, offre verte, sans engagement...' },
                { icon: '📝', step: 'Étape 3', title: 'Souscrire', desc: 'Remplissez le formulaire en ligne en 5 minutes. Munissez-vous de votre numéro de compteur.' },
                { icon: '🔄', step: 'Étape 4', title: 'Basculer', desc: `Le changement s'effectue sous 21 jours. Réseau ${reseau} — aucune coupure.` },
              ].map(s => (
                <div key={s.step} className="bg-card border border-border rounded-2xl p-4">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-xs text-secondary font-semibold mt-2">{s.step}</p>
                  <h3 className="font-semibold text-sm mt-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Économies par logement */}
        {offres[0] && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Économies possibles à {ville.nom} selon votre logement</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="py-2.5 px-3 text-left text-xs font-semibold">Logement</th>
                      <th className="py-2.5 px-3 text-right text-xs font-semibold">Conso</th>
                      <th className="py-2.5 px-3 text-right text-xs font-semibold">TRV</th>
                      <th className="py-2.5 px-3 text-right text-xs font-semibold">Meilleure</th>
                      <th className="py-2.5 px-3 text-right text-xs font-semibold text-secondary">Économie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOGEMENTS.map((l, i) => {
                      const trv = Math.round(l.conso * prix_ref + ref_abo);
                      const best = Math.round(l.conso * offres[0].prix_kwh + abo);
                      const eco = Math.round((prix_ref - offres[0].prix_kwh) * l.conso);
                      return (
                        <tr key={l.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                          <td className="py-2.5 px-3 text-xs">{l.label}</td>
                          <td className="py-2.5 px-3 text-right text-xs text-muted-foreground">~{l.conso.toLocaleString('fr-FR')} kWh</td>
                          <td className="py-2.5 px-3 text-right text-xs">{trv}€</td>
                          <td className="py-2.5 px-3 text-right text-xs">{best}€</td>
                          <td className="py-2.5 px-3 text-right text-xs font-bold text-secondary">-{eco}€</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Pourquoi changer */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl font-bold mb-6">Pourquoi changer de fournisseur {labelCourt} à {ville.nom} ?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: emoji, title: `Même ${labelCourt}`, desc: isElec ? `L'électricité qui arrive chez vous est identique. Le réseau ${reseau} assure la distribution à ${ville.nom}.` : `Le gaz naturel reste le même. ${reseau} assure la distribution à ${ville.nom}.` },
                { icon: '💰', title: 'Économies concrètes', desc: `Pour ${conso.toLocaleString('fr-FR')} kWh/an, économisez jusqu'à ${econoMax}€/an, soit ${Math.round(econoMax / 12)}€/mois de moins.` },
                { icon: '🔄', title: 'Changement simple', desc: `Moins de 10 minutes en ligne. Votre date, votre rythme. 21 jours max, zéro coupure.` },
              ].map(b => (
                <div key={b.title} className="bg-card border border-border rounded-2xl p-5">
                  <span className="text-2xl">{b.icon}</span>
                  <h3 className="font-semibold mt-2 mb-1">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Données locales */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Le {labelCourt} à {ville.nom} en chiffres</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Consommation moyenne', `${conso.toLocaleString('fr-FR')} kWh/an`],
                    ['Nombre de foyers raccordés', nb_foyers?.toLocaleString('fr-FR') || 'N/A'],
                    ['Gestionnaire réseau', `${reseau}${isElec && ville.nom_eld ? ` — ${ville.nom_eld}` : ''}`],
                    ['Prix de référence TRV 2026', `${prix_ref.toFixed(4).replace('.', ',')} €/kWh`],
                    ['Facture annuelle moyenne TRV', `~${Math.round(conso * prix_ref + ref_abo).toLocaleString('fr-FR')}€`],
                    ['Économie potentielle', `jusqu'à ${econoMax}€/an`],
                    ['Population', `${ville.population?.toLocaleString('fr-FR') || 'N/A'} habitants`],
                    ['Département', ville.departement || 'N/A'],
                    ['Région', ville.region || 'N/A'],
                  ].map(([label, value], i) => (
                    <tr key={label} className={`${i > 0 ? 'border-t border-border' : ''} ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{label}</td>
                      <td className="py-3 px-4 font-medium text-right text-sm">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Source : Enedis Open Data 2023 · CRE 2026 · geo.api.gouv.fr — Données non contractuelles</p>
          </div>
        </section>

        {/* Contenu SEO additionnel */}
        {contenu_conseils && (
          <section className="py-8">
            <div className="container mx-auto px-4 max-w-2xl prose prose-sm">
              <p>{contenu_conseils}</p>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Questions fréquentes — {labelCap} à {ville.nom}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {[
                { q: `Quel est le meilleur fournisseur ${labelCourt} à ${ville.nom} en 2026 ?`, a: `En 2026, l'offre ${offres[0]?.nom_offre || 'Extra Eco'} de ${offres[0]?.fournisseur || 'OHM Énergie'} est la plus compétitive à ${ville.nom} à ${offres[0]?.prix_kwh?.toFixed(4)?.replace('.', ',') || '0,2180'} €/kWh. Pour ${conso.toLocaleString('fr-FR')} kWh/an, vous économisez ${econoMax}€/an par rapport au ${ref_label}.` },
                { q: `Comment changer de fournisseur ${labelCourt} à ${ville.nom} ?`, a: `Le changement est simple : comparez sur Switchly, souscrivez en ligne en 5 minutes, et le changement s'effectue sous 21 jours. Le réseau ${reseau} coordonne la transition. C'est gratuit et sans coupure.` },
                { q: `Y a-t-il une coupure lors du changement à ${ville.nom} ?`, a: `Non, aucune coupure. La distribution ${isElec ? 'électrique' : 'du gaz'} est assurée par ${reseau} quel que soit votre fournisseur.` },
                { q: `Puis-je changer si je suis locataire à ${ville.nom} ?`, a: `Oui. Propriétaires et locataires peuvent librement choisir leur fournisseur ${labelCourt}. Aucune autorisation du propriétaire n'est requise.` },
                { q: `Combien coûte le changement de fournisseur à ${ville.nom} ?`, a: `Totalement gratuit. Aucun frais de résiliation ni de mise en service. Switchly est 100% gratuit — financé par les commissions versées par les fournisseurs uniquement en cas de souscription.` },
                { q: `Qui gère le réseau ${labelCourt} à ${ville.nom} ?`, a: ville.nom_eld ? `${ville.nom} est desservi par ${ville.nom_eld}, une Entreprise Locale de Distribution (ELD). Environ 5% des communes ont une ELD. Cela ne change pas votre droit de choisir votre fournisseur.` : `Le réseau ${isElec ? 'électrique' : 'de gaz'} de ${ville.nom} est géré par ${reseau}, ${isElec ? 'qui dessert 95% des communes françaises.' : 'principal distributeur de gaz en France.'}` },
              ].map((faq, i) => (
                <AccordionItem key={`q${i}`} value={`q${i}`} className="bg-card border border-border rounded-2xl px-4">
                  <AccordionTrigger className="text-sm font-medium text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-12 bg-[hsl(145,58%,30%)] text-white">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Prêt à économiser {econoMax}€/an sur votre {labelCourt} à {ville.nom} ?
            </h2>
            <p className="text-white/80 text-sm mb-6">Gratuit · Sans engagement · Résultat en 30 secondes</p>
            <Button size="lg" className="bg-white text-[hsl(145,58%,30%)] hover:bg-white/90 font-semibold" asChild>
              <Link to={comparerUrl}>Comparer gratuitement →</Link>
            </Button>
          </div>
        </section>

        {/* Villes proches */}
        {villesProches.length > 0 && (
          <section className="py-8">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-lg font-bold mb-4">Comparer l'{labelCourt} dans d'autres villes du département</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {villesProches.map((v: any) => (
                  <Link
                    key={v.slug}
                    to={`/${type}/${v.slug}`}
                    className="bg-card border border-border rounded-xl p-3 hover:border-secondary transition-colors group"
                  >
                    <p className="font-medium text-sm group-hover:text-secondary transition-colors">
                      {labelCap} {v.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">({v.code_postal})</p>
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-sm text-center">
                <Link to={`/${alt_type}/${ville.slug}`} className="text-primary hover:underline">
                  Voir les offres {alt_label} à {ville.nom} →
                </Link>
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
