import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ArrowLeft, Loader2, Shield, Zap, CheckCircle } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';

const CONSO_BASE: Record<string, number> = {
  '<30m²': 1500, '30-50m²': 2500, '50-75m²': 3800,
  '75-100m²': 5200, '100-150m²': 7000, '+150m²': 10500,
};
const C_TYPE: Record<string, number> = { maison: 1.2, appartement: 1.0 };
const C_CHAUF: Record<string, number> = { electrique: 1.6, gaz: 1.0, autre: 1.1 };
const C_PERS: Record<string, number> = { '1': 0.8, '2': 1.0, '3': 1.2, '4': 1.4, '5+': 1.6 };

const SUPERFICIES = ['<30m²', '30-50m²', '50-75m²', '75-100m²', '100-150m²', '+150m²'];
const FOURNISSEURS = ['EDF', 'Engie', 'TotalEnergies', 'OHM Énergie', 'Octopus Energy', 'Autre'];
const STEP_LABELS = ['Localisation', 'Énergie', 'Logement', 'Chauffage', 'Fournisseur', 'Coordonnées'];

export default function ComparerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [villeNom, setVilleNom] = useState(searchParams.get('ville') || '');
  const [form, setForm] = useState({
    code_postal: searchParams.get('cp') || '',
    ville: searchParams.get('ville') || '',
    type_energie: searchParams.get('type') || '',
    type_logement: '',
    superficie: '',
    nb_personnes: '',
    mode_chauffage: '',
    eau_chaude: '',
    fournisseur_actuel: '',
    tarif_reglemente: null as boolean | null,
    telephone: '',
    consentement: false,
  });

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (form.code_postal.length === 5) {
      fetch(`https://geo.api.gouv.fr/communes?codePostal=${form.code_postal}&fields=nom&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (data?.[0]?.nom) {
            setVilleNom(data[0].nom);
            update('ville', data[0].nom);
          }
        })
        .catch(() => {});
    } else {
      setVilleNom('');
    }
  }, [form.code_postal]);

  const conso = Math.round(
    (CONSO_BASE[form.superficie] || 4000) *
    (C_TYPE[form.type_logement] || 1.0) *
    (C_CHAUF[form.mode_chauffage] || 1.0) *
    (C_PERS[form.nb_personnes] || 1.0)
  );
  const economie = Math.round(conso * (0.2516 - 0.2160));

  const canNext = () => {
    if (step === 1) return form.code_postal.length === 5 && villeNom !== '';
    if (step === 2) return form.type_energie !== '';
    if (step === 3) return form.type_logement !== '' && form.superficie !== '' && form.nb_personnes !== '';
    if (step === 4) return form.mode_chauffage !== '' && form.eau_chaude !== '';
    if (step === 5) return true;
    if (step === 6) return !form.telephone || form.consentement;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const utm = new URLSearchParams(window.location.search);
      await (supabase.from('leads') as any).insert({
        code_postal: form.code_postal,
        ville: form.ville,
        type_energie: form.type_energie,
        type_logement: form.type_logement,
        superficie: form.superficie,
        nb_personnes: parseInt(form.nb_personnes) || null,
        mode_chauffage: form.mode_chauffage,
        eau_chaude: form.eau_chaude,
        fournisseur_actuel: form.fournisseur_actuel || null,
        tarif_reglemente: form.tarif_reglemente,
        conso_estimee_kwh: conso,
        economie_estimee: economie,
        telephone: form.telephone || null,
        consentement: form.consentement,
        source_url: window.location.pathname,
        utm_source: utm.get('utm_source'),
        utm_medium: utm.get('utm_medium'),
        utm_campaign: utm.get('utm_campaign'),
        statut: 'nouveau',
      });
    } catch (e) {
      console.error('Lead insert error:', e);
    }
    navigate(`/resultats?type=${form.type_energie}&cp=${form.code_postal}&ville=${encodeURIComponent(form.ville)}&conso=${conso}&economie=${economie}`);
  };

  const handleNext = () => {
    if (step < 6) setStep(s => s + 1);
    else handleSubmit();
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Comparer les offres énergie | Switchly</title>
        <meta name="description" content="Comparez électricité et gaz en 30 secondes. Gratuit, sans engagement." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Hero header with gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" aria-hidden="true" />
        <div className="relative z-10 container mx-auto px-4 pt-8 pb-6">
          <div className="max-w-[540px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Comparateur 100% gratuit
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight"
            >
              Trouvez la <span className="gradient-text">meilleure offre</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base text-muted-foreground mb-2"
            >
              Comparez les offres en 30 secondes. Sans engagement.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="px-4 pb-8 -mt-2">
        <div className="max-w-[540px] mx-auto">
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm pb-4 pt-2 rounded-b-xl"
          >
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span className="font-medium">Étape {step} sur 6</span>
              <span className="font-medium text-foreground">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-secondary h-2.5 rounded-full"
                animate={{ width: `${(step / 6) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEP_LABELS.map((l, i) => (
                <span
                  key={l}
                  className={`text-[10px] transition-colors ${
                    i + 1 < step
                      ? 'text-secondary font-semibold'
                      : i + 1 === step
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  {i + 1 < step ? '✓' : i + 1 === step ? '●' : '○'}
                </span>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepWrapper key="s1">
                <StepHeader title="Où êtes-vous situé ?" subtitle="Pour trouver les offres disponibles chez vous" />
                <div>
                  <label className="text-sm font-semibold block mb-2">Code postal</label>
                  <input
                    type="text"
                    value={form.code_postal}
                    onChange={e => update('code_postal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Ex: 44000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    inputMode="numeric"
                    maxLength={5}
                    autoFocus
                  />
                  {villeNom && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-2"
                    >
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-sm font-medium text-secondary">{villeNom}</span>
                    </motion.div>
                  )}
                </div>
              </StepWrapper>
            )}

            {step === 2 && (
              <StepWrapper key="s2">
                <StepHeader title="Que souhaitez-vous comparer ?" subtitle="Sélectionnez une catégorie" />
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: '⚡ Électricité', v: 'electricite' },
                    { label: '🔥 Gaz naturel', v: 'gaz' },
                    { label: '⚡🔥 Électricité + Gaz', v: 'les_deux' },
                  ].map(o => (
                    <SelectCard key={o.v} selected={form.type_energie === o.v} onClick={() => update('type_energie', o.v)}>
                      <span className="text-base">{o.label}</span>
                    </SelectCard>
                  ))}
                </div>
              </StepWrapper>
            )}

            {step === 3 && (
              <StepWrapper key="s3">
                <StepHeader title="Votre logement" subtitle="Pour estimer votre consommation" />
                <div>
                  <label className="text-sm font-semibold block mb-3">Type de logement</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '🏠 Maison', v: 'maison' },
                      { label: '🏢 Appartement', v: 'appartement' },
                    ].map(o => (
                      <SelectCard key={o.v} selected={form.type_logement === o.v} onClick={() => update('type_logement', o.v)} className="justify-center">
                        <span>{o.label}</span>
                      </SelectCard>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-3">Superficie</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPERFICIES.map(s => (
                      <SelectCard key={s} selected={form.superficie === s} onClick={() => update('superficie', s)} className="justify-center py-2.5 text-xs">
                        {s}
                      </SelectCard>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-3">Nombre d'occupants</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['1', '2', '3', '4', '5+'].map(n => (
                      <SelectCard key={n} selected={form.nb_personnes === n} onClick={() => update('nb_personnes', n)} className="justify-center py-2.5 font-bold">
                        {n}
                      </SelectCard>
                    ))}
                  </div>
                </div>
              </StepWrapper>
            )}

            {step === 4 && (
              <StepWrapper key="s4">
                <StepHeader title="Votre chauffage" subtitle="Pour affiner l'estimation" />
                <div>
                  <label className="text-sm font-semibold block mb-3">Mode de chauffage</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '⚡ Électrique', v: 'electrique' },
                      { label: '🔥 Gaz', v: 'gaz' },
                      { label: '🔆 Autre', v: 'autre' },
                    ].map(o => (
                      <SelectCard key={o.v} selected={form.mode_chauffage === o.v} onClick={() => update('mode_chauffage', o.v)} className="justify-center flex-col text-center">
                        <span className="text-xs">{o.label}</span>
                      </SelectCard>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-3">Eau chaude</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '⚡ Électrique', v: 'electrique' },
                      { label: '🔥 Gaz', v: 'gaz' },
                    ].map(o => (
                      <SelectCard key={o.v} selected={form.eau_chaude === o.v} onClick={() => update('eau_chaude', o.v)} className="justify-center">
                        <span>{o.label}</span>
                      </SelectCard>
                    ))}
                  </div>
                </div>
              </StepWrapper>
            )}

            {step === 5 && (
              <StepWrapper key="s5">
                <StepHeader title="Votre situation actuelle" subtitle="Optionnel — pour calculer vos économies" />
                <div>
                  <label className="text-sm font-semibold block mb-3">Fournisseur actuel</label>
                  <div className="space-y-2">
                    {FOURNISSEURS.map(f => (
                      <SelectCard key={f} selected={form.fournisseur_actuel === f} onClick={() => update('fournisseur_actuel', f)} className="w-full">
                        {f}
                        {form.fournisseur_actuel === f && (
                          <span className="ml-auto">
                            <CheckCircle className="w-4 h-4 text-secondary" />
                          </span>
                        )}
                      </SelectCard>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-3">Êtes-vous au tarif réglementé ?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Oui', v: true },
                      { label: 'Non', v: false },
                      { label: 'Je ne sais pas', v: null },
                    ].map(o => (
                      <SelectCard key={String(o.v)} selected={form.tarif_reglemente === o.v} onClick={() => update('tarif_reglemente', o.v)} className="justify-center text-xs">
                        {o.label}
                      </SelectCard>
                    ))}
                  </div>
                </div>
              </StepWrapper>
            )}

            {step === 6 && (
              <StepWrapper key="s6">
                <StepHeader title="Recevez vos résultats" subtitle="Dernière étape avant vos offres" />
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-secondary">
                    ~{conso.toLocaleString('fr-FR')} kWh/an · Économie jusqu'à {economie}€/an
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Téléphone (optionnel)</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={e => update('telephone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Pour recevoir un récapitulatif par SMS</p>
                </div>
                {form.telephone && (
                  <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={form.consentement}
                      onChange={e => update('consentement', e.target.checked)}
                      className="mt-0.5 accent-secondary w-4 h-4"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      J'accepte de recevoir mon récapitulatif par SMS. Données jamais revendues.{' '}
                      <a href="/politique-confidentialite" className="underline text-primary">Politique de confidentialité</a>
                    </span>
                  </label>
                )}
              </StepWrapper>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mt-6"
          >
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={() => setStep(s => s - 1)} className="flex-1 h-12">
                <ArrowLeft className="mr-2 w-4 h-4" /> Retour
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canNext() || loading}
              className="flex-1 h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 6 ? (
                'Voir mes offres →'
              ) : (
                <>Continuer <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </motion.div>

          {step === 5 && (
            <button onClick={handleNext} className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground text-center transition-colors">
              Passer cette étape →
            </button>
          )}

          {/* Reassurance badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-2"
          >
            {[
              { icon: <Shield className="w-4 h-4 text-primary" />, label: 'Données sécurisées' },
              { icon: <Zap className="w-4 h-4 text-secondary" />, label: 'Sans coupure' },
              { icon: <CheckCircle className="w-4 h-4 text-secondary" />, label: '100% gratuit' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-2 py-3 shadow-sm text-center">
                {item.icon}
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}

function SelectCard({ selected, onClick, children, className = '' }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-sm font-medium text-left ${
        selected
          ? 'border-secondary bg-secondary/5 text-foreground shadow-sm ring-1 ring-secondary/20'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StepWrapper({ children, ...props }: { children: React.ReactNode } & Record<string, any>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm mt-4"
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}
