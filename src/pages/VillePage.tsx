import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Leaf, Star, ChevronRight, Users, Zap, Globe, Phone } from 'lucide-react';

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

/* ── Skeleton ────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-56 mx-auto rounded-xl" />
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3 text-center">
                <Skeleton className="h-6 w-6 mx-auto rounded" />
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

      {/* Sticky phone */}
      <div className="sticky top-14 z-20 bg-secondary text-white py-2 text-center text-sm shadow-sm">
        <a href="tel:0973727300" className="flex items-center justify-center gap-2">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-bold">09 73 72 73 00</span>
          <span className="hidden sm:inline text-white/85">· Conseiller gratuit · Lun–Ven 7h–21h</span>
        </a>
      </div>

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-2xl py-2.5">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap" aria-label="Fil d'Ariane">
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

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            {emoji} {labelCap}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
            Comparateur {label}<br className="hidden sm:block" /> {ville.nom} ({ville.code_postal})
          </h1>
          <p className="text-base text-muted-foreground mb-6">
            Économisez jusqu'à{' '}
            <span className="font-bold text-secondary">{econoMax}€/an</span>{' '}
            sur votre facture {labelCourt} · {ville.population?.toLocaleString('fr-FR') || ''} habitants
          </p>

          {/* CTA bloc */}
          <Button
            size="lg"
            className="h-12 px-8 bg-secondary hover:bg-secondary/90 text-white font-bold text-base shadow-md w-full sm:w-auto"
            asChild
          >
            <Link to={comparerUrl}>Comparer gratuitement →</Link>
          </Button>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-4 text-xs text-muted-foreground">
            {['✅ Gratuit', '🔒 Sans engagement', `${emoji} Sans coupure`, '⏱ 30 secondes'].map(b => (
              <span key={b} className="font-medium">{b}</span>
            ))}
          </div>

          {/* Lien page alternative */}
          <p className="mt-4 text-xs text-muted-foreground">
            Aussi disponible :{' '}
            <Link to={`/${alt_type}/${ville.slug}`} className="text-primary hover:underline font-medium">
              Offres {alt_label} à {ville.nom} →
            </Link>
          </p>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ─────────────────────────────── */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: Users, label: 'Habitants',      value: ville.population?.toLocaleString('fr-FR') || 'N/A' },
              { icon: Zap,   label: 'Conso moyenne',  value: `${conso.toLocaleString('fr-FR')} kWh/an` },
              { icon: Globe, label: 'Réseau',          value: reseau },
            ].map(c => (
              <div key={c.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <c.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm font-bold leading-tight">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Source : Enedis Open Data 2023</p>
        </div>
      </section>

      {/* ── CONTENU SEO INTRO ─────────────────────────── */}
      {(contenu_intro || contenu_contexte) && (
        <section className="py-6 bg-card">
          <div className="container mx-auto px-4 max-w-2xl">
            {contenu_intro && <p className="text-sm text-muted-foreground leading-relaxed">{contenu_intro}</p>}
            {contenu_contexte && <p className="text-sm text-muted-foreground leading-relaxed mt-3">{contenu_contexte}</p>}
          </div>
        </section>
      )}

      {/* ── OFFRES ────────────────────────────────────── */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            Meilleures offres {label} à {ville.nom} en 2026
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Triées par économies · Données actualisées en temps réel</p>

          <div className="space-y-3">
            {offres.slice(0, 5).map((o, i) => {
              const eco  = Math.max(0, Math.round((prix_ref - o.prix_kwh) * conso));
              const prix = Math.round(o.prix_kwh * conso + o.abonnement_annuel);
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-card border rounded-2xl p-5 transition-all hover:shadow-md ${
                    i === 0 ? 'border-secondary shadow-sm ring-1 ring-secondary/20' : 'border-border'
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
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Prix calculés pour {conso.toLocaleString('fr-FR')} kWh/an (moyenne à {ville.nom}). Tarifs indicatifs. Mis à jour le {new Date().toLocaleDateString('fr-FR')}.
          </p>
        </div>
      </section>

      {/* ── PHONE CTA ─────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-2xl py-6">
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="font-bold text-base mb-1">Besoin d'aide pour choisir ?</p>
          <p className="text-sm text-muted-foreground mb-3">Nos conseillers vous guident en moins de 5 minutes</p>
          <a href="tel:0973727300" className="inline-flex items-center gap-2 text-secondary font-bold text-xl hover:underline">
            <Phone className="w-5 h-5" /> 09 73 72 73 00
          </a>
          <p className="text-xs text-muted-foreground mt-1">Lun–Ven 7h–21h · Sam 8h30–18h30 · Dim 9h–17h30</p>
        </div>
      </div>

      {/* ── COMMENT CHANGER ────────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Comment changer de fournisseur {labelCourt} à {ville.nom} ?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🔍', step: '1', title: 'Comparer',  desc: `Entrez le CP ${ville.code_postal} et votre conso sur Switchly.` },
              { icon: '✅', step: '2', title: 'Choisir',   desc: 'Sélectionnez l\'offre adaptée : fixe, verte, sans engagement...' },
              { icon: '📝', step: '3', title: 'Souscrire', desc: 'Formulaire en ligne en 5 min. Ayez votre numéro de compteur.' },
              { icon: '🔄', step: '4', title: 'Basculer',  desc: `Sous 21 jours max. Réseau ${reseau} — aucune coupure.` },
            ].map(s => (
              <div key={s.step} className="bg-card border border-border rounded-2xl p-4">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xs text-secondary font-semibold mt-2">Étape {s.step}</p>
                <h3 className="font-semibold text-sm mt-0.5 mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TABLEAU ÉCONOMIES ─────────────────────────── */}
      {offres[0] && (
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Économies possibles à {ville.nom} selon votre logement</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-2.5 px-3 text-left text-xs font-semibold">Logement</th>
                    <th className="py-2.5 px-3 text-right text-xs font-semibold">TRV</th>
                    <th className="py-2.5 px-3 text-right text-xs font-semibold">Meilleure offre</th>
                    <th className="py-2.5 px-3 text-right text-xs font-semibold text-secondary">Économie</th>
                  </tr>
                </thead>
                <tbody>
                  {LOGEMENTS.map((l, i) => {
                    const trv  = Math.round(l.conso * prix_ref + ref_abo);
                    const best = Math.round(l.conso * offres[0].prix_kwh + (offres[0].abonnement_annuel || 149));
                    const eco  = Math.max(0, Math.round((prix_ref - offres[0].prix_kwh) * l.conso));
                    return (
                      <tr key={l.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                        <td className="py-2.5 px-3 text-xs">{l.label}</td>
                        <td className="py-2.5 px-3 text-right text-xs">{trv}€/an</td>
                        <td className="py-2.5 px-3 text-right text-xs">{best}€/an</td>
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

      {/* ── POURQUOI CHANGER ──────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Pourquoi changer de fournisseur {labelCourt} à {ville.nom} ?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: emoji, title: `Même ${labelCourt}`,    desc: `Le réseau ${reseau} assure la distribution. La qualité de votre énergie ne change pas.` },
              { icon: '💰',  title: 'Économies concrètes', desc: `Jusqu'à ${econoMax}€/an pour ${conso.toLocaleString('fr-FR')} kWh/an, soit ~${Math.round(econoMax / 12)}€/mois.` },
              { icon: '🔄',  title: 'Changement simple',   desc: 'Moins de 10 minutes en ligne. 21 jours max. Zéro coupure garantie.' },
            ].map(b => (
              <div key={b.title} className="bg-card border border-border rounded-2xl p-5">
                <span className="text-2xl">{b.icon}</span>
                <h3 className="font-semibold text-sm mt-2 mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DONNÉES LOCALES ───────────────────────────── */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Le {labelCourt} à {ville.nom} en chiffres</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Source : Enedis Open Data 2023 · CRE 2026 · geo.api.gouv.fr — Données non contractuelles
          </p>
        </div>
      </section>

      {/* ── SEO CONSEILS ──────────────────────────────── */}
      {contenu_conseils && (
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <p className="text-sm text-muted-foreground leading-relaxed">{contenu_conseils}</p>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-xl font-bold mb-5">Questions fréquentes — {labelCap} à {ville.nom}</h2>
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
              <AccordionItem
                key={`q${i}`}
                value={`q${i}`}
                className="bg-card border border-border rounded-xl px-4"
              >
                <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section className="py-12 bg-secondary text-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Prêt à économiser {econoMax}€/an sur votre {labelCourt} à {ville.nom} ?
          </h2>
          <p className="text-white/80 text-sm mb-6">Gratuit · Sans engagement · Résultat en 30 secondes</p>
          <Button
            size="lg"
            className="bg-white text-secondary hover:bg-white/90 font-bold h-12 px-8 text-base shadow-lg w-full sm:w-auto"
            asChild
          >
            <Link to={comparerUrl}>Comparer gratuitement →</Link>
          </Button>
        </div>
      </section>

      {/* ── VILLES PROCHES ────────────────────────────── */}
      {villesProches.length > 0 && (
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-base font-bold mb-4 text-muted-foreground">
              {labelCap} dans d'autres villes du département
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {villesProches.map((v: any) => (
                <Link
                  key={v.slug}
                  to={`/${type}/${v.slug}`}
                  className="bg-card border border-border rounded-xl p-3 hover:border-primary hover:shadow-sm transition-all group"
                >
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{v.nom}</p>
                  <p className="text-xs text-muted-foreground">{v.code_postal}</p>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-center">
              <Link to={`/${alt_type}/${ville.slug}`} className="text-primary hover:underline font-medium">
                Voir les offres {alt_label} à {ville.nom} →
              </Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
