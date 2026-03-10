import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, ArrowLeft, Building, Home } from 'lucide-react';

export default function ComparerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<1|2|3>(1);
  const [form, setForm] = useState({
    codePostal: searchParams.get('cp') || '',
    typeEnergie: searchParams.get('type') || '',
    typeLogement: '',
    superficie: '',
    occupants: '',
    fournisseurActuel: '',
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const progressPct = (step / 3) * 100;

  const handleNext = () => {
    if (step < 3) setStep(s => (s + 1) as 1|2|3);
    else {
      const p = new URLSearchParams({
        cp: form.codePostal,
        type: form.typeEnergie,
        logement: form.typeLogement,
        superficie: form.superficie,
        occupants: form.occupants,
        fournisseur: form.fournisseurActuel,
      });
      navigate(`/resultats?${p.toString()}`);
    }
  };

  const canNext = () => {
    if (step === 1) return form.codePostal.length === 5 && form.typeEnergie !== '';
    if (step === 2) return form.typeLogement !== '' && form.superficie !== '';
    return true;
  };

  const SUPERFICIES = ['Moins de 30m²','30-50m²','50-75m²','75-100m²','100-150m²','Plus de 150m²'];
  const FOURNISSEURS = form.typeEnergie === 'internet'
    ? ['Orange','SFR','Bouygues','Free','Autre']
    : ['EDF (tarif réglementé)','Engie','TotalEnergies','Octopus Energy','OHM Énergie','Autre'];

  return (
    <>
      <Helmet>
        <title>Comparer les offres énergie et internet | Switchly</title>
        <meta name="description" content="Comparez électricité, gaz et internet en 30 secondes. Gratuit, sans engagement." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 py-8 px-4 pt-24">
          <div className="max-w-lg mx-auto">
            <div className="mb-8">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Étape {step} sur 3</span>
                <span>{Math.round(progressPct)}% complété</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h1 className="text-xl font-bold mb-1">Que souhaitez-vous comparer ?</h1>
                    <p className="text-sm text-muted-foreground">Sélectionnez une catégorie</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '⚡ Électricité', v: 'electricite' },
                      { label: '🔥 Gaz', v: 'gaz' },
                      { label: '📶 Internet', v: 'internet' },
                      { label: '🔄 Tout comparer', v: 'tous' },
                    ].map(o => (
                      <button
                        key={o.v}
                        onClick={() => update('typeEnergie', o.v)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                          form.typeEnergie === o.v
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Votre code postal</label>
                    <input
                      type="text"
                      value={form.codePostal}
                      onChange={e => update('codePostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="Ex: 44000"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                      inputMode="numeric"
                      maxLength={5}
                    />
                  </div>
                  <Button className="w-full" size="lg" onClick={handleNext} disabled={!canNext()}>
                    Continuer <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Votre logement</h2>
                    <p className="text-sm text-muted-foreground">Pour estimer votre consommation</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-3">Type de logement</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Appartement', icon: Building, v: 'appartement' },
                        { label: 'Maison', icon: Home, v: 'maison' },
                      ].map(({ label, icon: Icon, v }) => (
                        <button
                          key={v}
                          onClick={() => update('typeLogement', v)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            form.typeLogement === v
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className="w-6 h-6 text-primary" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-3">Superficie</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPERFICIES.map(s => (
                        <button
                          key={s}
                          onClick={() => update('superficie', s)}
                          className={`py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                            form.superficie === s
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-3">Nombre d'occupants</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['1','2','3','4','5+'].map(n => (
                        <button
                          key={n}
                          onClick={() => update('occupants', n)}
                          className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                            form.occupants === n
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Retour
                    </Button>
                    <Button size="lg" onClick={handleNext} disabled={!canNext()} className="flex-1">
                      Continuer <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Votre situation actuelle</h2>
                    <p className="text-sm text-muted-foreground">Pour calculer vos économies réelles</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-3">Votre fournisseur actuel</label>
                    <div className="space-y-2">
                      {FOURNISSEURS.map(f => (
                        <button
                          key={f}
                          onClick={() => update('fournisseurActuel', f)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-sm transition-all text-left ${
                            form.fournisseurActuel === f
                              ? 'border-primary bg-primary/5 font-semibold'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {f}
                          {form.fournisseurActuel === f && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 text-xs text-muted-foreground">
                    💡 90% des Français chez EDF peuvent économiser en changeant de fournisseur.
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)} className="flex-1">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Retour
                    </Button>
                    <Button size="lg" onClick={handleNext} className="flex-1">
                      Voir les offres 🎉
                    </Button>
                  </div>
                  <button onClick={handleNext} className="w-full text-xs text-muted-foreground hover:text-foreground text-center">
                    Passer cette étape →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span>🔒 Données sécurisées</span>
              <span>✅ Aucun appel commercial</span>
              <span>🆓 Totalement gratuit</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
