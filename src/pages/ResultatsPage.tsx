import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Leaf, Star, Loader2, Phone, ArrowLeft, Shield, Zap, CheckCircle } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';

interface Offre {
  id: string;
  fournisseur: string;
  nom_offre: string;
  type: string;
  prix_kwh: number;
  abonnement_annuel: number;
  label_vert: boolean;
  url_souscription: string;
}

export default function ResultatsPage() {
  const [searchParams] = useSearchParams();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarifs, setTarifs] = useState({ trv_elec: 0.2516, trv_gaz: 0.1244 });

  const type = searchParams.get('type') || 'electricite';
  const cp = searchParams.get('cp') || '';
  const ville = searchParams.get('ville') || '';
  const conso = parseInt(searchParams.get('conso') || '4000');
  const economie = parseInt(searchParams.get('economie') || '0');

  const prix_ref = type === 'gaz' ? tarifs.trv_gaz : tarifs.trv_elec;
  const ref_label = type === 'gaz' ? 'tarif repère gaz' : 'tarif réglementé EDF';
  const typeLabel = type === 'gaz' ? 'gaz' : 'électricité';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tarifsRes, offersRes] = await Promise.all([
          (supabase.from('tarifs_energie') as any)
            .select('trv_elec_kwh, trv_gaz_kwh')
            .eq('id', 'current')
            .single(),
          supabase.functions.invoke('selectra-offers', {
            body: { type: type === 'les_deux' ? 'electricite' : type, code_postal: cp },
          }),
        ]);

        if (tarifsRes.data) {
          setTarifs({
            trv_elec: tarifsRes.data.trv_elec_kwh || 0.2516,
            trv_gaz: tarifsRes.data.trv_gaz_kwh || 0.1244,
          });
        }

        if (!offersRes.error && offersRes.data?.offres) {
          setOffres(offersRes.data.offres);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      }
      setLoading(false);
    };
    fetchData();
  }, [type, cp]);

  const prixAnnuel = (o: Offre) => Math.round(o.prix_kwh * conso + o.abonnement_annuel);
  const ecoOffre = (o: Offre) => Math.round((prix_ref - o.prix_kwh) * conso);

  return (
    <PageTransition>
      <Helmet>
        <title>Offres {typeLabel} {ville ? `à ${ville}` : ''} | Switchly</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Hero-style header with gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" aria-hidden="true" />
        <div className="relative z-10 container mx-auto px-4 pt-8 pb-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Link to="/comparer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors">
                <ArrowLeft className="w-4 h-4" /> Modifier mes critères
              </Link>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight"
            >
              Vos offres <span className="gradient-text">{typeLabel}</span> {ville ? `à ${ville}` : ''}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {ville && (
                <span className="inline-flex items-center text-xs bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                  📍 {ville} ({cp})
                </span>
              )}
              <span className="inline-flex items-center text-xs bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                ⚡ {conso.toLocaleString('fr-FR')} kWh/an
              </span>
              {economie > 0 && (
                <span className="inline-flex items-center text-xs bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full font-semibold">
                  💰 Économie jusqu'à {economie}€/an
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky phone banner */}
      <div className="sticky top-16 z-20 bg-secondary text-secondary-foreground py-2.5 text-center text-sm shadow-md">
        <a href="tel:0973727300" className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="font-semibold">09 73 72 73 00</span>
          <span className="hidden sm:inline">· Conseiller disponible · Lun-Ven 7h-21h</span>
        </a>
      </div>

      {/* Offers section */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Recherche des meilleures offres…</p>
            </div>
          ) : offres.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm"
            >
              <p className="text-lg font-semibold mb-2">Aucune offre disponible pour le moment</p>
              <p className="text-sm text-muted-foreground mb-6">
                Nous n'avons pas trouvé d'offres pour votre profil. Essayez de modifier vos critères ou contactez un conseiller.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/comparer"><ArrowLeft className="mr-2 w-4 h-4" /> Modifier mes critères</Link>
                </Button>
                <Button size="lg" asChild>
                  <a href="tel:0973727300"><Phone className="mr-2 w-4 h-4" /> Appeler un conseiller</a>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                {offres.length} offre{offres.length > 1 ? 's' : ''} trouvée{offres.length > 1 ? 's' : ''} · Classées par économie
              </motion.p>

              {offres.map((o, i) => {
                const eco = ecoOffre(o);
                const prix = prixAnnuel(o);
                const isBest = i === 0;
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-card border rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                      isBest
                        ? 'border-secondary shadow-md ring-1 ring-secondary/20'
                        : 'border-border shadow-sm'
                    }`}
                  >
                    {isBest && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-3">
                        <Star className="w-3 h-3 fill-secondary" /> Meilleure offre
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-base sm:text-lg">{o.fournisseur}</p>
                        <p className="text-sm text-muted-foreground">{o.nom_offre}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {o.label_vert && (
                            <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                              <Leaf className="w-3 h-3" /> Vert
                            </span>
                          )}
                          <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium">Prix {o.type}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl sm:text-3xl font-bold">
                          {prix}€
                          <span className="text-sm font-normal text-muted-foreground">/an</span>
                        </p>
                        {eco > 0 && (
                          <p className="text-sm font-bold text-secondary mt-0.5">+{eco}€/an</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">vs {ref_label}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                      {o.prix_kwh.toFixed(4)} €/kWh · Abo {o.abonnement_annuel}€/an
                    </div>
                    <Button
                      className={`w-full mt-4 h-12 text-base font-semibold ${
                        isBest ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md' : ''
                      }`}
                      variant={isBest ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <a href={o.url_souscription} target="_blank" rel="noopener noreferrer">
                        Souscrire en ligne <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2.5 text-center">
                      Sans engagement · 21 jours max · 100% en ligne
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Phone CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-sm card-hover"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-base font-bold mb-1">Vous hésitez entre les offres ?</p>
            <p className="text-sm text-muted-foreground mb-4">Nos conseillers vous aident à choisir en moins de 5 minutes</p>
            <a href="tel:0973727300" className="inline-flex items-center gap-2 text-secondary font-bold text-xl hover:underline transition-colors">
              09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground mt-2">Lun-Ven 7h-21h · Sam 8h30-18h30 · Dim 9h-17h30</p>
          </motion.div>

          {/* Reassurance badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: <Zap className="w-4 h-4 text-primary" />, label: 'Sans coupure' },
              { icon: <CheckCircle className="w-4 h-4 text-secondary" />, label: 'Sans engagement' },
              { icon: <Shield className="w-4 h-4 text-primary" />, label: 'Données sécurisées' },
              { icon: <Star className="w-4 h-4 text-secondary" />, label: '100% gratuit' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 shadow-sm">
                {item.icon}
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </motion.div>

          <p className="text-xs text-muted-foreground text-center mt-8 mb-4">
            Switchly est rémunéré par commission versée par le fournisseur lors d'une souscription. Service 100% gratuit pour vous.
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
