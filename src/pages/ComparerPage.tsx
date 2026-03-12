import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ArrowLeft, Loader2, Shield, Zap, CheckCircle, Phone } from 'lucide-react';

/* ── Calcul conso ─────────────────────────────────────── */
const CONSO_BASE: Record<string, number> = {
  '<30m²': 1500, '30-50m²': 2500, '50-75m²': 3800,
  '75-100m²': 5200, '100-150m²': 7000, '+150m²': 10500,
};
const C_TYPE:  Record<string, number> = { maison: 1.2, appartement: 1.0 };
const C_CHAUF: Record<string, number> = { electrique: 1.6, gaz: 1.0, autre: 1.1 };
const C_PERS:  Record<string, number> = { '1': 0.8, '2': 1.0, '3': 1.2, '4': 1.4, '5+': 1.6 };

const SUPERFICIES  = ['<30m²', '30-50m²', '50-75m²', '75-100m²', '100-150m²', '+150m²'];
const FOURNISSEURS = ['EDF', 'Engie', 'TotalEnergies', 'OHM Énergie', 'Octopus Energy', 'Autre'];
const STEP_LABELS  = ['Localisation', 'Énergie', 'Logement', 'Chauffage', 'Fournisseur', 'Coordonnées'];

/* ── Sub-composants ───────────────────────────────────── */
function Card({
  selected, onClick, children, className = '',
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-sm font-medium text-left w-full ${
        selected
          ? 'border-secondary bg-secondary/8 text-foreground shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:shadow-sm text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StepBox({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-sm mt-4"
    >
      {children}
    </motion.div>
  );
}

function StepHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function ComparerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [villeNom, setVilleNom] = useState(searchParams.get('ville') || '');

  const [form, setForm] = useState({
    code_postal:      searchParams.get('cp')   || '',
    ville:            searchParams.get('ville') || '',
    type_energie:     searchParams.get('type')  || '',
    type_logement:    '',
    superficie:       '',
    nb_personnes:     '',
    mode_chauffage:   '',
    eau_chaude:       '',
    fournisseur_actuel: '',
    tarif_reglemente: null as boolean | null,
    telephone:        '',
    consentement:     false,
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  // Lookup ville from CP
  useEffect(() => {
    if (form.code_postal.length === 5) {
      fetch(`https://geo.api.gouv.fr/communes?codePostal=${form.code_postal}&fields=nom&limit=1`)
        .then(r => r.json())
        .then(d => { if (d?.[0]?.nom) { setVilleNom(d[0].nom); set('ville', d[0].nom); } })
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
    if (step === 1) return form.code_postal.length === 5 && !!villeNom;
    if (step === 2) return !!form.type_energie;
    if (step === 3) return !!form.type_logement && !!form.superficie && !!form.nb_personnes;
    if (step === 4) return !!form.mode_chauffage && !!form.eau_chaude;
    if (step === 5) return true;
    if (step === 6) return !form.telephone || form.consentement;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const utm = new URLSearchParams(window.location.search);
      await (supabase.from('leads') as any).insert({
        code_postal: form.code_postal, ville: form.ville,
        type_energie: form.type_energie, type_logement: form.type_logement,
        superficie: form.superficie, nb_personnes: parseInt(form.nb_personnes) || null,
        mode_chauffage: form.mode_chauffage, eau_chaude: form.eau_chaude,
        fournisseur_actuel: form.fournisseur_actuel || null,
        tarif_reglemente: form.tarif_reglemente,
        conso_estimee_kwh: conso, economie_estimee: economie,
        telephone: form.telephone || null, consentement: form.consentement,
        source_url: window.location.pathname,
        utm_source: utm.get('utm_source'), utm_medium: utm.get('utm_medium'),
        utm_campaign: utm.get('utm_campaign'), statut: 'nouveau',
      });
    } catch (e) { console.error(e); }
    navigate(`/resultats?type=${form.type_energie}&cp=${form.code_postal}&ville=${encodeURIComponent(form.ville)}&conso=${conso}&economie=${economie}`);
  };

  const next = () => { if (step < 6) setStep(s => s + 1); else submit(); };

  return (
    <>
      <Helmet>
        <title>Comparer les offres énergie | Switchly</title>
        <meta name="description" content="Comparez électricité et gaz en 30 secondes. Gratuit, sans engagement." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Header minimal */}
      <section className="bg-gradient-subtle px-4 pt-8 pb-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Comparateur 100% gratuit
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Trouvez la <span className="gradient-text">meilleure offre</span>
          </h1>
          <p className="text-sm text-muted-foreground">Résultat en 30 secondes · Sans engagement</p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 pb-32 md:pb-12 -mt-1">
        <div className="max-w-lg mx-auto">

          {/* Progress sticky */}
          <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-sm pb-3 pt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-medium">Étape {step}/6</span>
              <span className="font-semibold text-foreground">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-secondary h-2 rounded-full"
                animate={{ width: `${(step / 6) * 100}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Étape 1 — Code postal */}
            {step === 1 && (
              <StepBox key="s1">
                <StepHead title="Où êtes-vous situé ?" subtitle="Pour trouver les offres disponibles chez vous" />
                <div>
                  <label className="text-sm font-semibold block mb-2">Code postal</label>
                  <input
                    type="text"
                    value={form.code_postal}
                    onChange={e => set('code_postal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Ex : 44000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    inputMode="numeric"
                    maxLength={5}
                    autoFocus
                  />
                  {villeNom && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-2"
                    >
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-sm font-semibold text-secondary">{villeNom}</span>
                    </motion.div>
                  )}
                </div>
              </StepBox>
            )}

            {/* Étape 2 — Type énergie */}
            {step === 2 && (
              <StepBox key="s2">
                <StepHead title="Que souhaitez-vous comparer ?" subtitle="Sélectionnez une catégorie" />
                <div className="space-y-2">
                  {[
                    { label: '⚡ Électricité', v: 'electricite' },
                    { label: '🔥 Gaz naturel', v: 'gaz' },
                    { label: '⚡🔥 Électricité + Gaz', v: 'les_deux' },
                  ].map(o => (
                    <Card key={o.v} selected={form.type_energie === o.v} onClick={() => set('type_energie', o.v)}>
                      {o.label}
                    </Card>
                  ))}
                </div>
              </StepBox>
            )}

            {/* Étape 3 — Logement */}
            {step === 3 && (
              <StepBox key="s3">
                <StepHead title="Votre logement" subtitle="Pour estimer votre consommation" />
                <div>
                  <label className="text-sm font-semibold block mb-2">Type de logement</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: '🏠 Maison', v: 'maison' }, { label: '🏢 Appartement', v: 'appartement' }].map(o => (
                      <Card key={o.v} selected={form.type_logement === o.v} onClick={() => set('type_logement', o.v)} className="justify-center">
                        {o.label}
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Superficie</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPERFICIES.map(s => (
                      <Card key={s} selected={form.superficie === s} onClick={() => set('superficie', s)} className="justify-center py-3 text-xs">
                        {s}
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Nombre d'occupants</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['1', '2', '3', '4', '5+'].map(n => (
                      <Card key={n} selected={form.nb_personnes === n} onClick={() => set('nb_personnes', n)} className="justify-center py-3 font-bold text-base">
                        {n}
                      </Card>
                    ))}
                  </div>
                </div>
              </StepBox>
            )}

            {/* Étape 4 — Chauffage */}
            {step === 4 && (
              <StepBox key="s4">
                <StepHead title="Votre chauffage" subtitle="Pour affiner l'estimation" />
                <div>
                  <label className="text-sm font-semibold block mb-2">Mode de chauffage</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ label: '⚡ Électrique', v: 'electrique' }, { label: '🔥 Gaz', v: 'gaz' }, { label: '🔆 Autre', v: 'autre' }].map(o => (
                      <Card key={o.v} selected={form.mode_chauffage === o.v} onClick={() => set('mode_chauffage', o.v)} className="justify-center text-center flex-col gap-0.5">
                        <span className="text-sm">{o.label}</span>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Eau chaude</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: '⚡ Électrique', v: 'electrique' }, { label: '🔥 Gaz', v: 'gaz' }].map(o => (
                      <Card key={o.v} selected={form.eau_chaude === o.v} onClick={() => set('eau_chaude', o.v)} className="justify-center">
                        {o.label}
                      </Card>
                    ))}
                  </div>
                </div>
              </StepBox>
            )}

            {/* Étape 5 — Fournisseur actuel */}
            {step === 5 && (
              <StepBox key="s5">
                <StepHead title="Votre situation actuelle" subtitle="Optionnel — pour calculer vos économies exactes" />
                <div>
                  <label className="text-sm font-semibold block mb-2">Fournisseur actuel</label>
                  <div className="space-y-2">
                    {FOURNISSEURS.map(f => (
                      <Card key={f} selected={form.fournisseur_actuel === f} onClick={() => set('fournisseur_actuel', f)}>
                        {f}
                        {form.fournisseur_actuel === f && <CheckCircle className="w-4 h-4 text-secondary ml-auto" />}
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Êtes-vous au tarif réglementé ?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ label: 'Oui', v: true }, { label: 'Non', v: false }, { label: 'Je ne sais pas', v: null }].map(o => (
                      <Card key={String(o.v)} selected={form.tarif_reglemente === o.v} onClick={() => set('tarif_reglemente', o.v)} className="justify-center text-xs py-3">
                        {o.label}
                      </Card>
                    ))}
                  </div>
                </div>
              </StepBox>
            )}

            {/* Étape 6 — Contact */}
            {step === 6 && (
              <StepBox key="s6">
                <StepHead title="Recevez vos résultats" subtitle="Dernière étape avant vos offres" />
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-secondary">
                    ~{conso.toLocaleString('fr-FR')} kWh/an · Économie estimée : {economie}€/an
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Téléphone <span className="font-normal text-muted-foreground">(optionnel)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={e => set('telephone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Pour recevoir un récapitulatif par SMS</p>
                </div>
                {form.telephone && (
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-muted/50 rounded-xl">
                    <input
                      type="checkbox"
                      checked={form.consentement}
                      onChange={e => set('consentement', e.target.checked)}
                      className="mt-0.5 accent-secondary w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      J'accepte de recevoir mon récapitulatif par SMS. Données jamais revendues.{' '}
                      <a href="/politique-confidentialite" className="underline text-primary">Confidentialité</a>
                    </span>
                  </label>
                )}
              </StepBox>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-5">
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={() => setStep(s => s - 1)} className="flex-1 h-12">
                <ArrowLeft className="mr-2 w-4 h-4" /> Retour
              </Button>
            )}
            <Button
              size="lg"
              onClick={next}
              disabled={!canNext() || loading}
              className="flex-1 h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-white shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 6 ? (
                'Voir mes offres →'
              ) : (
                <>Continuer <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </div>

          {step === 5 && (
            <button onClick={next} className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground text-center transition-colors">
              Passer cette étape →
            </button>
          )}

          {/* Reassurance */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { icon: Shield, label: 'Données sécurisées' },
              { icon: Zap, label: 'Sans coupure' },
              { icon: CheckCircle, label: '100% gratuit' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-2 py-3 text-center">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Phone CTA */}
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            Ou appelez un conseiller :
            <a href="tel:0973727300" className="text-primary font-semibold hover:underline">09 73 72 73 00</a>
          </div>
        </div>
      </section>
    </>
  );
}
