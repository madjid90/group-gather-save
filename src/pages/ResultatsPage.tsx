import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Leaf, Star, Loader2, Phone, ArrowLeft, Shield, Zap, CheckCircle } from 'lucide-react';

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

  const type    = searchParams.get('type') || 'electricite';
  const cp      = searchParams.get('cp') || '';
  const ville   = searchParams.get('ville') || '';
  const conso   = parseInt(searchParams.get('conso') || '4000');
  const prix_ref = type === 'gaz' ? tarifs.trv_gaz : tarifs.trv_elec;
  const typeLabel = type === 'gaz' ? 'gaz' : 'électricité';
  const refLabel  = type === 'gaz' ? 'tarif repère gaz CRE' : 'tarif réglementé EDF';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [tarifsRes, offresRes] = await Promise.all([
        (supabase.from('tarifs_energie') as any)
          .select('trv_elec_kwh, trv_gaz_kwh').eq('id', 'current').single(),
        supabase.functions.invoke('selectra-offers', {
          body: { type: type === 'les_deux' ? 'electricite' : type, code_postal: cp },
        }),
      ]);
      if (tarifsRes.data) setTarifs({ trv_elec: tarifsRes.data.trv_elec_kwh || 0.2516, trv_gaz: tarifsRes.data.trv_gaz_kwh || 0.1244 });
      if (!offresRes.error && offresRes.data?.offres) setOffres(offresRes.data.offres);
      setLoading(false);
    })();
  }, [type, cp]);

  const prixAnnuel = (o: Offre) => Math.round(o.prix_kwh * conso + o.abonnement_annuel);
  const economie  = (o: Offre) => Math.round((prix_ref - o.prix_kwh) * conso);

  return (
    <>
      <Helmet>
        <title>Offres {typeLabel}{ville ? ` à ${ville}` : ''} | Switchly</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Header */}
      <section className="bg-background px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <Link to="/comparer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Modifier mes critères
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
            Vos offres <span className="text-secondary font-extrabold">{typeLabel}</span>
            {ville ? ` à ${ville}` : ''}
          </h1>
          <div className="flex flex-wrap gap-2">
            {ville && (
              <span className="inline-flex items-center text-xs bg-card border border-border px-3 py-1.5 rounded-full">
                📍 {ville}{cp ? ` (${cp})` : ''}
              </span>
            )}
            <span className="inline-flex items-center text-xs bg-card border border-border px-3 py-1.5 rounded-full">
              ⚡ {conso.toLocaleString('fr-FR')} kWh/an
            </span>
          </div>
        </div>
      </section>

      {/* Phone banner sticky */}
      <div className="sticky top-14 z-20 bg-secondary text-white py-2.5 text-center text-sm shadow-md">
        <a href="tel:0973727300" className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold">09 73 72 73 00</span>
          <span className="hidden sm:inline text-white/85">· Conseiller disponible · Lun–Ven 7h–21h</span>
        </a>
      </div>

      {/* Offers */}
      <section className="py-8 px-4 pb-32 md:pb-12">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Recherche des meilleures offres…</p>
            </div>
          ) : offres.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-lg font-semibold mb-2">Aucune offre disponible</p>
              <p className="text-sm text-muted-foreground mb-6">
                Essayez de modifier vos critères ou contactez un conseiller.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/comparer"><ArrowLeft className="mr-2 w-4 h-4" /> Modifier</Link>
                </Button>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
                  <a href="tel:0973727300"><Phone className="mr-2 w-4 h-4" /> Appeler un conseiller</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {offres.length} offre{offres.length > 1 ? 's' : ''} — classées par économies
              </p>

              {offres.map((o, i) => {
                const eco   = economie(o);
                const prix  = prixAnnuel(o);
                const best  = i === 0;
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`bg-card border rounded-2xl p-5 transition-all hover:shadow-md ${
                      best ? 'border-secondary shadow-sm ring-1 ring-secondary/20' : 'border-border'
                    }`}
                  >
                    {best && (
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
                        <p className="text-2xl font-bold leading-none">
                          {prix}€
                          <span className="text-sm font-normal text-muted-foreground">/an</span>
                        </p>
                        {eco > 0 && (
                          <p className="text-sm font-bold text-secondary mt-0.5">
                            Économie : {eco}€/an
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">vs {refLabel}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      {o.prix_kwh.toFixed(4)} €/kWh · Abonnement {o.abonnement_annuel}€/an
                    </div>

                    <Button
                      className={`w-full mt-4 h-11 font-semibold ${best ? 'bg-secondary hover:bg-secondary/90 text-white' : ''}`}
                      variant={best ? 'default' : 'outline'}
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
          )}

          {/* Phone CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-11 h-11 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-5 h-5 text-secondary" />
            </div>
            <p className="font-bold text-base mb-1">Vous hésitez entre les offres ?</p>
            <p className="text-sm text-muted-foreground mb-3">Nos conseillers vous aident en moins de 5 minutes</p>
            <a href="tel:0973727300" className="text-secondary font-bold text-xl hover:underline">
              09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground mt-1">Lun–Ven 7h–21h · Sam 8h30–18h30 · Dim 9h–17h30</p>
          </motion.div>

          {/* Reassurance */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon: Zap, label: 'Sans coupure' },
              { icon: CheckCircle, label: 'Sans engagement' },
              { icon: Shield, label: 'Données sécurisées' },
              { icon: Star, label: '100% gratuit' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
                <item.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Switchly est rémunéré par commission versée par le fournisseur lors d'une souscription. Service 100% gratuit pour vous.
          </p>
        </div>
      </section>
    </>
  );
}
