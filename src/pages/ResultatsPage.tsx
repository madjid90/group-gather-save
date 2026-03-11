import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Leaf, Star } from 'lucide-react';

const CONSO: Record<string, number> = {
  'Moins de 30m²': 1800, '30-50m²': 2800, '50-75m²': 4000,
  '75-100m²': 5500, '100-150m²': 7500, 'Plus de 150m²': 11000,
};

const ELEC = [
  { id: 1, fournisseur: 'OHM Énergie', nom: 'OHM Initial', prix_kwh: 0.1820, abo: 9.00, vert: false, sans_eng: true, url: 'https://www.awin1.com/cread.php?awinmid=48701&awinaffid=VOTRE_AWIN_ID&clickref=switchly&p=https%3A%2F%2Fohm-energie.fr', couleur: '#FF6B35', desc: 'Le moins cher du marché, sans engagement', logo: '⚡' },
  { id: 2, fournisseur: 'Octopus Energy', nom: 'Offre Simone', prix_kwh: 0.1850, abo: 9.51, vert: true, sans_eng: true, url: 'https://octopusenergy.fr', couleur: '#E83E8C', desc: '100% renouvelable, prix fixe garanti 1 an', logo: '🐙' },
  { id: 3, fournisseur: 'Mint Énergie', nom: 'Mint Zen', prix_kwh: 0.1890, abo: 9.51, vert: true, sans_eng: true, url: 'https://mint-energie.com', couleur: '#00C851', desc: 'Énergie verte, service client 5 étoiles', logo: '🌿' },
  { id: 4, fournisseur: 'TotalEnergies', nom: 'Classique', prix_kwh: 0.1950, abo: 9.51, vert: false, sans_eng: false, url: 'https://totalenergies.fr/particuliers/electricite', couleur: '#EF4444', desc: 'Grande marque, offre stable et fiable', logo: '🔴' },
];

const GAZ = [
  { id: 5, fournisseur: 'OHM Énergie', nom: 'Gaz Initial', prix_kwh: 0.0830, abo: 10.65, vert: false, sans_eng: true, url: 'https://www.awin1.com/cread.php?awinmid=48701&awinaffid=VOTRE_AWIN_ID&clickref=switchly-gaz&p=https%3A%2F%2Fohm-energie.fr', couleur: '#FF6B35', desc: 'Le moins cher du marché gaz', logo: '🔥' },
  { id: 6, fournisseur: 'Ekwateur', nom: 'Gaz Vert', prix_kwh: 0.0889, abo: 10.65, vert: true, sans_eng: true, url: 'https://ekwateur.fr', couleur: '#7CB342', desc: 'Biogaz 100% renouvelable', logo: '🌱' },
  { id: 7, fournisseur: 'ENI', nom: 'Gaz Garantie', prix_kwh: 0.0850, abo: 10.65, vert: false, sans_eng: false, url: 'https://eni.fr', couleur: '#FFDD00', desc: 'Prix fixe garanti 1 an', logo: '⭐' },
];

const INTERNET = [
  { id: 8, fournisseur: 'Free', nom: 'Freebox Revolution', prix_kwh: 0, abo: 29.99, vert: false, sans_eng: false, url: 'https://free.fr/freebox/', couleur: '#CD2029', desc: 'Fibre 1 Gbit/s, TV incluse', logo: '📡' },
  { id: 9, fournisseur: 'Bouygues Telecom', nom: 'Bbox Must', prix_kwh: 0, abo: 27.99, vert: false, sans_eng: false, url: 'https://www.bouyguestelecom.fr/box-internet', couleur: '#0066CC', desc: 'Wi-Fi 6, débit garanti', logo: '📶' },
  { id: 10, fournisseur: 'SFR', nom: 'Box Fibre', prix_kwh: 0, abo: 26.99, vert: false, sans_eng: false, url: 'https://www.awin1.com/cread.php?awinmid=7315&awinaffid=VOTRE_AWIN_ID&clickref=switchly-sfr&p=https%3A%2F%2Fwww.sfr.fr%2Foffre-internet%2F', couleur: '#E2001A', desc: 'Fibre optique, SFR TV 6 mois', logo: '🔴' },
  { id: 11, fournisseur: 'RED by SFR', nom: 'Box Fibre RED', prix_kwh: 0, abo: 23.99, vert: false, sans_eng: true, url: 'https://www.awin1.com/cread.php?awinmid=7310&awinaffid=VOTRE_AWIN_ID&clickref=switchly-red&p=https%3A%2F%2Fwww.red-by-sfr.fr%2Fbox-internet%2F', couleur: '#CC0000', desc: 'Fibre sans engagement, le moins cher', logo: '🔴' },
];

export default function ResultatsPage() {
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<'tous' | 'vert' | 'sans_eng'>('tous');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [lead, setLead] = useState({ prenom: '', telephone: '' });

  const type = searchParams.get('type') || 'electricite';
  const superficie = searchParams.get('superficie') || '50-75m²';
  const cp = searchParams.get('cp') || '';

  const conso = CONSO[superficie] || 4000;
  const coutEDF = Math.round(conso * 0.2516 * 1.2 + 9.51 * 12 * 1.2);

  const base = type === 'internet' ? INTERNET : type === 'gaz' ? GAZ : ELEC;
  const offers = base.filter(o =>
    filter === 'vert' ? o.vert : filter === 'sans_eng' ? o.sans_eng : true
  );

  const eco = (o: any) => {
    if (type === 'internet') return Math.round((45 - o.abo) * 12);
    return Math.round(coutEDF - (conso * o.prix_kwh * 1.2 + o.abo * 12 * 1.2));
  };

  const choose = (o: any) => { setSelected(o); setShowModal(true); };

  const submit = async () => {
    if (selected) {
      try {
        await supabase.from('leads' as any).insert({
          prenom: lead.prenom,
          telephone: lead.telephone,
          code_postal: cp,
          type_energie: type,
          fournisseur_choisi: selected.fournisseur,
          offre_choisie: selected.nom,
          url_affiliation: selected.url,
          source: 'comparateur',
          statut: 'nouveau',
        });
      } catch (e) {
        console.error('Lead insert error:', e);
      }
      window.open(selected.url, '_blank');
    }
    setShowModal(false);
  };

  return (
    <>
      <Helmet>
        <title>Comparer offres {type} {cp ? `à ${cp}` : ''} | Switchly</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-6 px-4 pt-24">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-xl font-bold">
                    {offers.length} offres disponibles{cp && ` à ${cp}`}
                  </h1>
                  <p className="text-sm text-muted-foreground">Triées par économies — {superficie}</p>
                </div>
                {type !== 'internet' && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">EDF estimé : </span>
                    <span className="font-bold text-destructive">{coutEDF}€/an</span>
                  </div>
                )}
              </div>
              {type !== 'internet' && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[
                    { l: 'Toutes', v: 'tous' as const },
                    { l: '🌿 Énergie verte', v: 'vert' as const },
                    { l: '🔓 Sans engagement', v: 'sans_eng' as const },
                  ].map(f => (
                    <button
                      key={f.v}
                      onClick={() => setFilter(f.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        filter === f.v
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {offers.map((o, i) => {
                const e = eco(o);
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-card border rounded-2xl p-4 ${
                      i === 0 ? 'border-primary shadow-md' : 'border-border'
                    }`}
                  >
                    {i === 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-3">
                        <Star className="w-3 h-3 fill-primary" /> Meilleure offre
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: o.couleur }}
                        >
                          {o.fournisseur.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{o.fournisseur}</p>
                          <p className="text-xs text-muted-foreground">{o.nom}</p>
                        </div>
                      </div>
                      {type !== 'internet' && e > 0 && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-secondary">-{e}€</p>
                          <p className="text-xs text-muted-foreground">par an</p>
                        </div>
                      )}
                      {type === 'internet' && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-primary">{o.abo}€</p>
                          <p className="text-xs text-muted-foreground">/mois</p>
                        </div>
                      )}
                    </div>
                    {o.desc && <p className="mt-2 text-xs text-muted-foreground">{o.desc}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {o.sans_eng && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Sans engagement</span>
                      )}
                      {o.vert && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> Énergie verte
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant={i === 0 ? 'hero' : 'outline'}
                      onClick={() => choose(o)}
                    >
                      Choisir cette offre <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Switchly est rémunéré par commission versée par le fournisseur lors d'une souscription. Service 100% gratuit pour vous.
            </p>

            <div className="mt-8 bg-muted/30 border border-border rounded-2xl p-5 text-center">
              <p className="text-sm font-semibold mb-1">Besoin d'aide pour choisir ?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Nos conseillers vous guident gratuitement pour trouver l'offre idéale selon votre situation.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/contact">Être rappelé gratuitement →</Link>
              </Button>
            </div>
          </div>
        </main>

        {showModal && selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="font-bold text-lg mb-1">
                Excellent choix ! 🎉
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Laissez votre prénom et téléphone pour recevoir un récapitulatif de votre offre par SMS. Facultatif — vous pouvez continuer sans.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={lead.prenom}
                  onChange={e => setLead(p => ({ ...p, prenom: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Votre téléphone (ex: 0612345678)"
                  value={lead.telephone}
                  onChange={e => setLead(p => ({ ...p, telephone: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 mb-4">
                🔒 Données jamais revendues. Utilisées uniquement pour votre suivi Switchly.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(selected.url, '_blank');
                    setShowModal(false);
                  }}
                >
                  Accéder sans mes infos
                </Button>
                <Button className="flex-1" onClick={submit}>
                  Continuer →
                </Button>
              </div>
            </motion.div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
