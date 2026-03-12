import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Leaf, Star, ChevronRight, Users, Zap, Globe, Phone, CheckCircle, Shield, ArrowRight, TrendingDown, MapPin, Home } from 'lucide-react';
import { MobileFixedCTA } from '@/components/landing/MobileFixedCTA';
import { LogoCarousel } from '@/components/landing/LogoCarousel';

/* ── Types ──────────────────────────────────────────── */
interface Ville {
  slug: string; nom: string; code_postal: string; code_insee: string;
  departement: string | null; region: string | null; population: number | null;
  nb_logements_elec: number | null; nb_logements_gaz: number | null;
  conso_moyenne_kwh: number | null; conso_gaz_kwh: number | null;
  reseau_elec: string | null; reseau_gaz: string | null; nom_eld: string | null;
  prix_trv_kwh: number | null; statut_publication: string | null;
  contenu_elec_intro: string | null; contenu_elec_contexte: string | null;
  contenu_elec_conseils: string | null; contenu_elec_meta: string | null;
  contenu_gaz_intro: string | null; contenu_gaz_contexte: string | null;
  contenu_gaz_conseils: string | null; contenu_gaz_meta: string | null;
}
interface Offre {
  id: string; fournisseur: string; nom_offre: string; type: string;
  prix_kwh: number; abonnement_annuel: number; label_vert: boolean; url_souscription: string;
}

/* ── Logements référence ─────────────────────────── */
const LOGEMENTS = [
  { label: 'Studio (<30m²)',      conso: 1500 },
  { label: 'Appart (30-50m²)',    conso: 2500 },
  { label: 'Appart (50-75m²)',    conso: 3800 },
  { label: 'Maison (75-100m²)',   conso: 5200 },
  { label: 'Maison (100-150m²)',  conso: 7000 },
  { label: 'Grande (>150m²)',     conso: 10500 },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/* ── Skeleton ────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="w-full">
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-4">
          <Skeleton className="h-6 w-48 mx-auto rounded-full" />
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto" />
          <Skeleton className="h-14 w-full max-w-md mx-auto rounded-2xl" />
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-3 text-center">
                <Skeleton className="h-8 w-8 mx-auto rounded-lg" />
                <Skeleton className="h-5 w-20 mx-auto" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Page principale ─────────────────────────────── */
export default function VillePage() {
  const { slug }    = useParams<{ slug: string }>();
  const location    = useLocation();
  const isElec      = !location.pathname.startsWith('/gaz/');
  const type        = isElec ? 'electricite' : 'gaz';
  const label       = isElec ? 'électricité' : 'gaz naturel';
  const labelCourt  = isElec ? 'électricité' : 'gaz';
  const labelCap    = isElec ? 'Électricité' : 'Gaz';
  const emoji       = isElec ? '⚡' : '🔥';
  const alt_type    = isElec ? 'gaz' : 'electricite';
  const alt_label   = isElec ? 'gaz' : 'électricité';

  const [ville,        setVille]        = useState<Ville | null>(null);
  const [offres,       setOffres]       = useState<Offre[]>([]);
  const [villesProches, setVillesProches] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [tarifs, setTarifs] = useState({ trv_elec: 0.2516, trv_gaz: 0.1244, abo_elec: 150, abo_gaz: 230 });

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const [villeRes, tarifsRes] = await Promise.all([
        (supabase.from('villes') as any).select('*').eq('slug', slug).single(),
        (supabase.from('tarifs_energie') as any)
          .select('trv_elec_kwh, trv_gaz_kwh, trv_elec_abo_annuel, trv_gaz_abo_annuel')
          .eq('id', 'current').single(),
      ]);
      if (villeRes.error || !villeRes.data) { setNotFound(true); setLoading(false); return; }
      const v = villeRes.data as Ville;
      setVille(v);
      if (tarifsRes.data) setTarifs({
        trv_elec: tarifsRes.data.trv_elec_kwh     || 0.2516,
        trv_gaz:  tarifsRes.data.trv_gaz_kwh      || 0.1244,
        abo_elec: tarifsRes.data.trv_elec_abo_annuel || 150,
        abo_gaz:  tarifsRes.data.trv_gaz_abo_annuel  || 230,
      });
      const [offresRes, prochesRes] = await Promise.all([
        supabase.functions.invoke('selectra-offers', { body: { type, code_postal: v.code_postal } }),
        (supabase.from('villes') as any)
          .select('slug, nom, code_postal, population')
          .eq('departement', v.departement)
          .eq('statut_publication', 'publiee')
          .neq('slug', slug)
          .order('population', { ascending: false })
          .limit(6),
      ]);
      if (offresRes.data?.offres)  setOffres(offresRes.data.offres);
      if (prochesRes.data)         setVillesProches(prochesRes.data);
      setLoading(false);
    })();
  }, [slug, type]);

  if (loading)  return <PageSkeleton />;
  if (notFound || !ville) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Commune non trouvée</h1>
      <p className="text-muted-foreground">Cette page n'existe pas encore ou est en cours de création.</p>
      <Button asChild><Link to="/">Retour à l'accueil</Link></Button>
    </div>
  );

  const isPreview = window.location.search.includes('preview=admin');
  if (!isPreview && ville.statut_publication && ville.statut_publication !== 'publiee') return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Page en cours de validation</h1>
      <p className="text-muted-foreground">Cette page sera bientôt disponible.</p>
      <Button asChild><Link to="/">Retour à l'accueil</Link></Button>
    </div>
  );

  /* ── Données dérivées ────────────────────────── */
  const prix_ref  = isElec ? tarifs.trv_elec : tarifs.trv_gaz;
  const ref_abo   = isElec ? tarifs.abo_elec : tarifs.abo_gaz;
  const ref_label = isElec ? 'tarif réglementé EDF' : 'tarif repère gaz CRE';
  const conso     = isElec ? (ville.conso_moyenne_kwh || 4800) : (ville.conso_gaz_kwh || 11000);
  const reseau    = isElec ? (ville.reseau_elec || 'Enedis') : (ville.reseau_gaz || 'GRDF');
  const nb_foyers = isElec ? ville.nb_logements_elec : ville.nb_logements_gaz;
  const econoMax  = offres[0] ? Math.max(0, Math.round((prix_ref - offres[0].prix_kwh) * conso)) : (isElec ? 300 : 150);
  const comparerUrl = `/comparer?cp=${ville.code_postal}&type=${type}&ville=${encodeURIComponent(ville.nom)}`;

  const contenu_intro    = isElec ? ville.contenu_elec_intro    : ville.contenu_gaz_intro;
  const contenu_contexte = isElec ? ville.contenu_elec_contexte : ville.contenu_gaz_contexte;
  const contenu_conseils = isElec ? ville.contenu_elec_conseils : ville.contenu_gaz_conseils;
  const metaIA           = isElec ? ville.contenu_elec_meta     : ville.contenu_gaz_meta;

  const metaDescription = metaIA ||
    `Comparez les offres ${label} à ${ville.nom} (${ville.code_postal}). ${ville.population?.toLocaleString('fr-FR') || ''} habitants. Économisez jusqu'à ${econoMax}€/an. Réseau ${reseau}. 100% gratuit, sans engagement.`;

  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `Quel est le meilleur fournisseur ${label} à ${ville.nom} en 2026 ?`,
        "acceptedAnswer": { "@type": "Answer", "text": `En 2026 à ${ville.nom}, l'offre la plus compétitive est celle de ${offres[0]?.fournisseur || 'OHM Énergie'} à ${offres[0]?.prix_kwh?.toFixed(4) || '0,2180'} €/kWh. Pour ${conso.toLocaleString('fr-FR')} kWh/an, l'économie est de ${econoMax}€/an vs le ${ref_label}.` } },
      { "@type": "Question", "name": `Comment changer de fournisseur ${labelCourt} à ${ville.nom} ?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Changer est gratuit, sans coupure, 100% en ligne. Le réseau ${reseau} assure la distribution. Comptez 21 jours maximum.` } },
      { "@type": "Question", "name": `Y a-t-il une coupure lors du changement à ${ville.nom} ?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Non, aucune coupure. La distribution est assurée par ${reseau} quel que soit votre fournisseur.` } },
      { "@type": "Question", "name": `Puis-je changer si je suis locataire à ${ville.nom} ?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Oui. Propriétaires et locataires peuvent librement choisir leur fournisseur.` } },
      { "@type": "Question", "name": `Combien coûte le changement à ${ville.nom} ?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Totalement gratuit. Aucun frais de résiliation ni de mise en service.` } },
      { "@type": "Question", "name": `Qui gère le réseau ${labelCourt} à ${ville.nom} ?`,
        "acceptedAnswer": { "@type": "Answer", "text": ville.nom_eld ? `${ville.nom} est desservi par ${ville.nom_eld}, une ELD.` : `Le réseau est géré par ${reseau}.` } },
    ]
  };
  const schemaBreadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil",   "item": "https://switchly.fr/" },
      { "@type": "ListItem", "position": 2, "name": labelCap,    "item": `https://switchly.fr/${type}/` },
      { "@type": "ListItem", "position": 3, "name": ville.nom,   "item": `https://switchly.fr/${type}/${ville.slug}` },
    ]
  };

  return (
    <>
      <Helmet>
        <title>Comparateur {label} {ville.nom} ({ville.code_postal}) — Meilleure offre 2026</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://switchly.fr/${type}/${ville.slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
      </Helmet>

      <div className="w-full">
        {/* ── BREADCRUMB ──────────────────────────────── */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl py-2.5">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Fil d'Ariane">
              <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link to={`/${type}/`} className="hover:text-primary transition-colors">{labelCap}</Link>
              {ville.departement && (
                <><ChevronRight className="w-3 h-3 flex-shrink-0" /><span>{ville.departement}</span></>
              )}
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-foreground font-medium">{ville.nom}</span>
            </nav>
          </div>
        </div>

        {/* ── HERO — style homepage ───────────────────── */}
        <section className="relative overflow-hidden bg-background py-14 md:py-20">
          <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              {emoji} Comparateur {labelCourt} à {ville.nom}
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight"
            >
              Économisez jusqu'à{' '}
              <span className="text-secondary font-extrabold">{econoMax}€/an</span>
              <br className="hidden sm:block" /> sur votre {labelCourt} à {ville.nom}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="text-base sm:text-lg text-muted-foreground mb-8"
            >
              {ville.population?.toLocaleString('fr-FR')} habitants · {ville.code_postal} · Réseau {reseau}
            </motion.p>

            {/* CTA box — style homepage search box */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-md mb-6 max-w-lg mx-auto"
            >
              <p className="text-sm font-semibold text-foreground mb-3">
                Comparez les offres {labelCourt} pour {ville.nom}
              </p>
              <Button
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-base shadow-sm"
                asChild
              >
                <Link to={comparerUrl}>
                  Comparer gratuitement
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Aussi disponible :{' '}
                <Link to={`/${alt_type}/${ville.slug}`} className="text-primary hover:underline font-medium">
                  Offres {alt_label} à {ville.nom} →
                </Link>
              </p>
            </motion.div>

            {/* Trust badges — like homepage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
            >
              {[
                { icon: CheckCircle, label: 'Sans coupure' },
                { icon: Zap, label: 'Sans engagement' },
                { icon: Shield, label: 'Données sécurisées' },
              ].map(({ icon: Icon, label: l }) => (
                <span key={l} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-secondary" />
                  {l}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CHIFFRES CLÉS ───────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4"
            >
              {[
                { icon: Users,        lbl: 'Habitants',     value: ville.population?.toLocaleString('fr-FR') || 'N/A' },
                { icon: Zap,          lbl: 'Conso moyenne', value: `${conso.toLocaleString('fr-FR')} kWh` },
                { icon: Globe,        lbl: 'Réseau',        value: reseau },
                { icon: TrendingDown, lbl: 'Économie max',  value: `${econoMax}€/an` },
              ].map(c => (
                <motion.div
                  key={c.lbl}
                  variants={fadeUp}
                  className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <c.icon className="w-6 h-6 mx-auto mb-2.5 text-primary" />
                  <p className="text-sm sm:text-base font-bold leading-tight">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.lbl}</p>
                </motion.div>
              ))}
            </motion.div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Source : {isElec ? 'Enedis' : 'GRDF'} Open Data 2023 · CRE, barème en vigueur
            </p>
          </div>
        </section>

        {/* ── CONTENU SEO INTRO ────────────────────────── */}
        {(contenu_intro || contenu_contexte) && (
          <section className="py-10 md:py-14 bg-card">
            <div className="container mx-auto px-4 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {contenu_intro && (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{contenu_intro}</p>
                )}
                {contenu_contexte && (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{contenu_contexte}</p>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* ── OFFRES ──────────────────────────────────── */}
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                Meilleures offres {label} à {ville.nom} en 2026
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Triées par économies · Données actualisées en temps réel</p>
            </motion.div>

            <div className="space-y-3">
              {offres.slice(0, 5).map((o, i) => {
                const eco  = Math.max(0, Math.round((prix_ref - o.prix_kwh) * conso));
                const prix = Math.round(o.prix_kwh * conso + o.abonnement_annuel);
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className={`bg-card border rounded-2xl p-5 transition-all hover:shadow-md ${
                      i === 0 ? 'border-secondary shadow-sm ring-1 ring-secondary/20' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {i === 0 && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-3">
                        <Star className="w-3 h-3 fill-secondary" /> Meilleure offre
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-base">{o.fournisseur}</p>
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
                        <p className="text-xl font-bold leading-none">
                          {prix}€<span className="text-sm font-normal text-muted-foreground">/an</span>
                        </p>
                        {eco > 0 && (
                          <p className="text-sm font-bold text-secondary mt-0.5">Économie : {eco}€/an</p>
                        )}
                        <p className="text-xs text-muted-foreground">vs {ref_label}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                      {o.prix_kwh.toFixed(4)} €/kWh · Abonnement {o.abonnement_annuel}€/an
                    </div>
                    <Button
                      className={`w-full mt-4 h-11 font-semibold ${i === 0 ? 'bg-secondary hover:bg-secondary/90 text-white' : ''}`}
                      variant={i === 0 ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <a href={o.url_souscription} target="_blank" rel="noopener noreferrer">
                        Souscrire en ligne <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Sans engagement · 21 jours max · 100% en ligne
                    </p>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Prix calculés pour {conso.toLocaleString('fr-FR')} kWh/an (moyenne à {ville.nom}). Tarifs indicatifs. Mis à jour le {new Date().toLocaleDateString('fr-FR')}.
            </p>
          </div>
        </section>

        {/* ── LOGO CAROUSEL FOURNISSEURS ────────────── */}
        <LogoCarousel />

        {/* ── COMMENT CHANGER — style "How it works" ──── */}
        <section className="py-10 md:py-14 bg-card">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">En 4 étapes simples</p>
              <h2 className="text-xl sm:text-2xl font-bold mb-8">Comment changer de fournisseur {labelCourt} à {ville.nom} ?</h2>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { icon: MapPin,       step: '1', title: 'Comparer',  desc: `Entrez le CP ${ville.code_postal} et votre conso sur Switchly.` },
                { icon: CheckCircle,  step: '2', title: 'Choisir',   desc: 'Sélectionnez l\'offre adaptée : fixe, verte, sans engagement...' },
                { icon: Home,         step: '3', title: 'Souscrire', desc: 'Formulaire en ligne en 5 min. Ayez votre numéro de compteur.' },
                { icon: Zap,          step: '4', title: 'Basculer',  desc: `Sous 21 jours max. Réseau ${reseau} — aucune coupure.` },
              ].map(s => (
                <motion.div
                  key={s.step}
                  variants={fadeUp}
                  className="bg-background border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-secondary font-semibold mt-3 uppercase tracking-wider">Étape {s.step}</p>
                  <h3 className="font-bold text-sm mt-1 mb-1.5">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── TABLEAU ÉCONOMIES ────────────────────────── */}
        {offres[0] && (
          <section className="py-10 md:py-14 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Économies possibles à {ville.nom} selon votre logement</h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="py-3 px-4 text-left text-xs font-semibold">Logement</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold">TRV</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold">Meilleure offre</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-secondary">Économie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOGEMENTS.map((l, i) => {
                      const trv  = Math.round(l.conso * prix_ref + ref_abo);
                      const best = Math.round(l.conso * offres[0].prix_kwh + (offres[0].abonnement_annuel || 149));
                      const eco  = Math.max(0, Math.round((prix_ref - offres[0].prix_kwh) * l.conso));
                      return (
                        <tr key={l.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                          <td className="py-3 px-4 text-xs font-medium">{l.label}</td>
                          <td className="py-3 px-4 text-right text-xs">{trv}€/an</td>
                          <td className="py-3 px-4 text-right text-xs">{best}€/an</td>
                          <td className="py-3 px-4 text-right text-xs font-bold text-secondary">-{eco}€</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── POURQUOI CHANGER — style Advantages ─────── */}
        <section className="py-10 md:py-14 bg-card">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Vos avantages</p>
              <h2 className="text-xl sm:text-2xl font-bold mb-8">Pourquoi changer de fournisseur {labelCourt} à {ville.nom} ?</h2>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-3 gap-4"
            >
              {[
                { icon: Zap,          title: `Même ${labelCourt}`,    desc: `Le réseau ${reseau} assure la distribution. La qualité de votre énergie ne change pas.` },
                { icon: TrendingDown, title: 'Économies concrètes', desc: `Jusqu'à ${econoMax}€/an pour ${conso.toLocaleString('fr-FR')} kWh/an, soit ~${Math.round(econoMax / 12)}€/mois.` },
                { icon: CheckCircle,  title: 'Changement simple',   desc: 'Moins de 10 minutes en ligne. 21 jours max. Zéro coupure garantie.' },
              ].map(b => (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  className="bg-background border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm mb-2">{b.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── DONNÉES LOCALES ─────────────────────────── */}
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Données locales</p>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Le {labelCourt} à {ville.nom} en chiffres</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Consommation moyenne',          `${conso.toLocaleString('fr-FR')} kWh/an`],
                    ['Foyers raccordés',               nb_foyers?.toLocaleString('fr-FR') || 'N/A'],
                    ['Gestionnaire réseau',            `${reseau}${isElec && ville.nom_eld ? ` — ${ville.nom_eld}` : ''}`],
                    ['Prix TRV 2026',                  `${prix_ref.toFixed(4).replace('.', ',')} €/kWh`],
                    ['Facture moyenne TRV',            `~${Math.round(conso * prix_ref + ref_abo).toLocaleString('fr-FR')}€/an`],
                    ['Économie potentielle',           `jusqu'à ${econoMax}€/an`],
                    ['Population',                    `${ville.population?.toLocaleString('fr-FR') || 'N/A'} hab.`],
                    ['Département',                   ville.departement || 'N/A'],
                    ['Région',                        ville.region || 'N/A'],
                  ].map(([lbl, val], i) => (
                    <tr key={lbl} className={`${i > 0 ? 'border-t border-border' : ''} ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{lbl}</td>
                      <td className="py-3 px-4 font-semibold text-right text-sm">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Source : {isElec ? 'Enedis' : 'GRDF'} Open Data 2023 · CRE, barème en vigueur · geo.api.gouv.fr
            </p>
          </div>
        </section>

        {/* ── SEO CONSEILS ─────────────────────────────── */}
        {contenu_conseils && (
          <section className="py-10 md:py-14 bg-card">
            <div className="container mx-auto px-4 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{contenu_conseils}</p>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── FAQ — style homepage ────────────────────── */}
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Questions fréquentes</p>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">{labelCap} à {ville.nom}</h2>
            </motion.div>
            <Accordion type="single" collapsible className="space-y-2">
              {[
                { q: `Quel est le meilleur fournisseur ${labelCourt} à ${ville.nom} en 2026 ?`,
                  a: `En 2026 à ${ville.nom}, ${offres[0]?.fournisseur || 'OHM Énergie'} propose l'offre la plus compétitive à ${offres[0]?.prix_kwh?.toFixed(4)?.replace('.', ',') || '0,2180'} €/kWh. Pour ${conso.toLocaleString('fr-FR')} kWh/an, vous économisez ${econoMax}€/an vs le ${ref_label}.` },
                { q: `Comment changer de fournisseur ${labelCourt} à ${ville.nom} ?`,
                  a: `Comparez sur Switchly, souscrivez en ligne en 5 minutes. Le changement s'effectue sous 21 jours. Réseau ${reseau} — gratuit et sans coupure.` },
                { q: `Y a-t-il une coupure lors du changement à ${ville.nom} ?`,
                  a: `Non, aucune coupure. La distribution est assurée par ${reseau} quel que soit votre fournisseur.` },
                { q: `Puis-je changer si je suis locataire à ${ville.nom} ?`,
                  a: `Oui, propriétaires et locataires peuvent librement choisir leur fournisseur. Aucune autorisation du propriétaire n'est requise.` },
                { q: `Combien coûte le changement à ${ville.nom} ?`,
                  a: `Totalement gratuit. Aucun frais de résiliation ni de mise en service. Switchly est financé par les commissions versées par les fournisseurs uniquement en cas de souscription.` },
                { q: `Qui gère le réseau ${labelCourt} à ${ville.nom} ?`,
                  a: ville.nom_eld
                    ? `${ville.nom} est desservi par ${ville.nom_eld}, une Entreprise Locale de Distribution (ELD). Cela ne change pas votre droit de choisir votre fournisseur.`
                    : `Le réseau de ${ville.nom} est géré par ${reseau}, ${isElec ? 'qui dessert 95% des communes françaises.' : 'principal distributeur de gaz en France.'}` },
              ].map((faq, i) => (
                <motion.div
                  key={`q${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <AccordionItem
                    value={`q${i}`}
                    className="bg-card border border-border rounded-xl px-4 hover:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── CTA FINAL — style homepage CTA ──────────── */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-center"
            >
              <div className="relative z-10">
                <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-4">
                  Économisez dès maintenant
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4 leading-tight">
                  Prêt à économiser {econoMax}€/an<br className="hidden sm:block" /> sur votre {labelCourt} à {ville.nom} ?
                </h2>
                <p className="text-base text-primary-foreground/85 mb-8 max-w-md mx-auto">
                  Gratuit · Sans engagement · Résultat en 30 secondes
                </p>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold h-12 px-8 text-base shadow-lg"
                  asChild
                >
                  <Link to={comparerUrl}>
                    Comparer gratuitement
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── PHONE CTA ───────────────────────────────── */}
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <p className="font-bold text-lg mb-1">Besoin d'aide pour choisir ?</p>
              <p className="text-sm text-muted-foreground mb-4">Nos conseillers vous guident en moins de 5 minutes</p>
              <a href="tel:0973727300" className="inline-flex items-center gap-2 text-secondary font-bold text-xl hover:underline">
                09 73 72 73 00
              </a>
              <p className="text-xs text-muted-foreground mt-2">Lun–Ven 7h–21h · Sam 8h30–18h30 · Dim 9h–17h30</p>
            </motion.div>
          </div>
        </section>

        {/* ── VILLES PROCHES ──────────────────────────── */}
        {villesProches.length > 0 && (
          <section className="py-10 md:py-14 bg-card">
            <div className="container mx-auto px-4 max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Maillage local</p>
                <h2 className="text-base sm:text-lg font-bold mb-5">
                  {labelCap} dans d'autres villes du département
                </h2>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {villesProches.map((v: any) => (
                  <motion.div key={v.slug} variants={fadeUp}>
                    <Link
                      to={`/${type}/${v.slug}`}
                      className="block bg-background border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">{v.nom}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-5">{v.code_postal}</p>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              <p className="mt-6 text-sm text-center">
                <Link to={`/${alt_type}/${ville.slug}`} className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                  Voir les offres {alt_label} à {ville.nom}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </section>
        )}

        <div className="h-24 md:hidden" />
      </div>

      <MobileFixedCTA />
    </>
  );
}
