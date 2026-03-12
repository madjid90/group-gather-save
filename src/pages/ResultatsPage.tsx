import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Leaf, Star, Loader2, Phone, ArrowLeft } from 'lucide-react';

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
        // Fetch tarifs + offers in parallel
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
    <>
      <Helmet>
        <title>Offres {typeLabel} {ville ? `à ${ville}` : ''} | Switchly</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Sticky phone banner */}
      <div className="sticky top-16 z-20 bg-[hsl(145,58%,30%)] text-white py-2 text-center text-sm">
        <a href="tel:0973727300" className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="font-semibold">09 73 72 73 00</span>
          <span className="hidden sm:inline">· Conseiller disponible · Lun-Ven 7h-21h</span>
        </a>
      </div>

      <div className="py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Profile summary */}
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2">
              Vos offres {typeLabel} {ville ? `à ${ville}` : ''}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {ville && <span className="text-xs bg-muted px-2.5 py-1 rounded-full">📍 {ville} ({cp})</span>}
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">⚡ {conso.toLocaleString('fr-FR')} kWh/an</span>
              {economie > 0 && <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-full font-medium">💰 Économie jusqu'à {economie}€/an</span>}
            </div>
            <Link to="/comparer" className="text-xs text-primary hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Modifier mes critères
            </Link>
          </div>

          {/* Offers */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : offres.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-lg font-semibold mb-2">Aucune offre disponible pour le moment</p>
              <p className="text-sm text-muted-foreground mb-4">
                Nous n'avons pas trouvé d'offres pour votre profil actuellement. Essayez de modifier vos critères ou contactez un conseiller.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/comparer"><ArrowLeft className="mr-2 w-4 h-4" /> Modifier mes critères</Link>
                </Button>
                <Button asChild>
                  <a href="tel:0973727300"><Phone className="mr-2 w-4 h-4" /> Appeler un conseiller</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {offres.map((o, i) => {
                const eco = ecoOffre(o);
                const prix = prixAnnuel(o);
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-card border rounded-2xl p-5 ${i === 0 ? 'border-secondary shadow-md' : 'border-border'}`}
                  >
                    {i === 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-secondary mb-3">
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
                        {eco > 0 && (
                          <p className="text-sm font-semibold text-secondary">+{eco}€/an</p>
                        )}
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
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Sans engagement · 21 jours max · 100% en ligne
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Selectra phone CTA */}
          <div className="mt-8 bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold mb-1">Vous hésitez entre les offres ?</p>
            <p className="text-xs text-muted-foreground mb-3">Nos conseillers vous aident à choisir en moins de 5 minutes</p>
            <a href="tel:0973727300" className="inline-flex items-center gap-2 text-secondary font-bold text-lg">
              <Phone className="w-5 h-5" /> 09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground mt-1">Lun-Ven 7h-21h · Sam 8h30-18h30 · Dim 9h-17h30</p>
          </div>

          {/* Reassurance */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span>🔄 Sans coupure</span>
            <span>✅ Sans engagement</span>
            <span>🔒 Données sécurisées</span>
            <span>💶 100% gratuit</span>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Switchly est rémunéré par commission versée par le fournisseur lors d'une souscription. Service 100% gratuit pour vous.
          </p>
        </div>
      </div>
    </>
  );
}
