import { useState, memo, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Home, Building2, Flame, Zap, ChevronLeft,
  Calculator, TrendingDown, Sparkles, Snowflake, Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

type Step = 1 | 2 | 3 | 4 | "result";

interface CalculatorProfile {
  logement: "appartement" | "maison" | null;
  surface: "moins_60" | "60_100" | "plus_100" | null;
  chauffage: "electrique" | "gaz" | "pompe_chaleur" | "fioul" | "collectif" | "autre" | null;
  facture: "moins_80" | "80_120" | "plus_120" | "inconnu" | null;
}

interface EstimationResult {
  minEconomie: number;
  maxEconomie: number;
  explication: string;
}

const stepOptions = {
  1: [
    { value: "appartement", label: "Appartement", icon: Building2 },
    { value: "maison", label: "Maison", icon: Home },
  ],
  2: [
    { value: "moins_60", label: "Moins de 60 m²" },
    { value: "60_100", label: "60 à 100 m²" },
    { value: "plus_100", label: "Plus de 100 m²" },
  ],
  3: [
    { value: "electrique", label: "Électrique", icon: Zap },
    { value: "gaz", label: "Gaz", icon: Flame },
    { value: "pompe_chaleur", label: "Pompe à chaleur", icon: Snowflake },
    { value: "fioul", label: "Fioul", icon: Droplets },
    { value: "collectif", label: "Chauffage collectif", icon: Building2 },
    { value: "autre", label: "Autre / Je ne sais pas" },
  ],
  4: [
    { value: "moins_80", label: "Moins de 80 €/mois" },
    { value: "80_120", label: "80 à 120 €/mois" },
    { value: "plus_120", label: "Plus de 120 €/mois" },
    { value: "inconnu", label: "Je ne sais pas" },
  ],
};

const stepTitles = {
  1: "Quel est votre type de logement ?",
  2: "Quelle est la surface de votre logement ?",
  3: "Quel est votre mode de chauffage ?",
  4: "Estimez votre facture mensuelle d'énergie",
};

// Comparison bar chart
const ComparisonChart = memo(function ComparisonChart({
  profile, savings,
}: { profile: CalculatorProfile; savings: number }) {
  const estimatedBill = useMemo(() => {
    let b = 1200;
    if (profile.logement === "maison") b += 400;
    if (profile.surface === "60_100") b += 300;
    else if (profile.surface === "plus_100") b += 600;
    if (profile.chauffage === "electrique") b += 200;
    else if (profile.chauffage === "gaz") b += 350;
    if (profile.facture === "80_120") b = Math.max(b, 1200);
    else if (profile.facture === "plus_120") b = Math.max(b, 1800);
    return b;
  }, [profile]);

  const after = estimatedBill - savings;
  const pct = Math.round((savings / estimatedBill) * 100);

  return (
    <div className="bg-muted/50 rounded-xl p-4 mb-5">
      <p className="text-xs font-semibold text-muted-foreground text-center mb-4 flex items-center justify-center gap-1.5">
        <TrendingDown className="w-3.5 h-3.5 text-primary" /> Comparaison avant / après
      </p>
      <div className="space-y-3">
        {[
          { label: "Aujourd'hui", value: estimatedBill, width: "100%", color: "bg-red-400/60" },
          { label: "Avec Switchly", value: after, width: `${(after / estimatedBill) * 100}%`, color: "bg-primary" },
        ].map(row => (
          <div key={row.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold">{row.value.toLocaleString()}€/an</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: row.width }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className={`h-full ${row.color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border/60 text-center text-sm">
        <span className="text-muted-foreground">Soit </span>
        <span className="font-bold text-primary">-{pct}%</span>
        <span className="text-muted-foreground"> sur vos factures</span>
      </div>
    </div>
  );
});

// Result view — UN SEUL CTA
const ResultView = memo(function ResultView({
  estimation, profile, onCTAClick, onReset,
}: { estimation: EstimationResult; profile: CalculatorProfile; onCTAClick: () => void; onReset: () => void }) {
  useEffect(() => {
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors: ["#22c55e", "#3b82f6", "#f59e0b"] });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      {/* Savings highlight */}
      <div className="bg-primary rounded-2xl p-6 mb-5">
        <p className="text-white/80 text-xs mb-2">Économies estimées par an</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-white">{estimation.minEconomie}€</span>
          <span className="text-xl text-white/60">à</span>
          <span className="text-4xl font-bold text-white">{estimation.maxEconomie}€</span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{estimation.explication}</p>

      {/* Chart */}
      <ComparisonChart
        profile={profile}
        savings={Math.round((estimation.minEconomie + estimation.maxEconomie) / 2)}
      />

      {/* Single CTA */}
      <Button
        size="lg"
        className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold text-base"
        onClick={onCTAClick}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Voir les offres disponibles →
      </Button>
      <p className="text-xs text-muted-foreground mt-2 mb-4">Gratuit · Sans engagement · 30 secondes</p>

      <button
        onClick={onReset}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Refaire le calcul
      </button>
    </motion.div>
  );
});

export const SavingsCalculator = memo(function SavingsCalculator() {
  const [step, setStep] = useState<Step>(1);
  const [profile, setProfile] = useState<CalculatorProfile>({
    logement: null, surface: null, chauffage: null, facture: null,
  });
  const [estimation, setEstimation] = useState<EstimationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getFallback = useCallback((p: CalculatorProfile): EstimationResult => {
    let min = 180, max = 280;
    if (p.logement === "maison") { min += 70; max += 120; }
    if (p.surface === "60_100") { min += 50; max += 80; }
    else if (p.surface === "plus_100") { min += 120; max += 180; }
    if (p.chauffage === "electrique") { min += 30; max += 50; }
    else if (p.chauffage === "gaz") { min += 80; max += 150; }
    else if (p.chauffage === "fioul") { min += 100; max += 180; }
    if (p.facture === "80_120") { min += 40; max += 60; }
    else if (p.facture === "plus_120") { min += 80; max += 120; }
    const logement = p.logement === "maison" ? "une maison" : "un appartement";
    return {
      minEconomie: Math.round(min / 10) * 10,
      maxEconomie: Math.round(max / 10) * 10,
      explication: `Pour ${logement} avec votre profil, changer de fournisseur via Switchly peut générer ces économies. Estimation basée sur des foyers similaires.`,
    };
  }, []);

  const getEstimation = useCallback(async (p: CalculatorProfile) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("estimate-savings", { body: { profile: p } });
      if (error) throw error;
      setEstimation(data);
    } catch {
      setEstimation(getFallback(p));
    } finally {
      setIsLoading(false);
      setStep("result");
    }
  }, [getFallback]);

  const handleSelect = useCallback(async (value: any) => {
    const p = { ...profile };
    if (step === 1) { p.logement = value; setProfile(p); setStep(2); }
    else if (step === 2) { p.surface = value; setProfile(p); setStep(3); }
    else if (step === 3) { p.chauffage = value; setProfile(p); setStep(4); }
    else if (step === 4) { p.facture = value; setProfile(p); await getEstimation(p); }
  }, [profile, step, getEstimation]);

  const handleCTA = useCallback(() => {
    localStorage.setItem("switchly_calculator_profile", JSON.stringify({ profile, estimation }));
    navigate("/comparer");
  }, [profile, estimation, navigate]);

  const reset = useCallback(() => {
    setStep(1);
    setProfile({ logement: null, surface: null, chauffage: null, facture: null });
    setEstimation(null);
  }, []);

  const currentStep = typeof step === "number" ? step : 4;

  return (
    <section id="estimateur" className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Estimateur gratuit
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Combien pouvez-vous économiser ?
          </h2>
          <p className="text-sm text-muted-foreground">
            Répondez à 4 questions pour découvrir votre potentiel d'économies.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Progress */}
          {step !== "result" && (
            <div className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-medium">Étape {currentStep}/4</span>
                {currentStep > 1 && (
                  <button
                    onClick={() => typeof step === "number" && step > 1 && setStep((step - 1) as Step)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Retour
                  </button>
                )}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-hero rounded-full"
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Calcul de votre estimation…</p>
                </motion.div>
              ) : step === "result" && estimation ? (
                <ResultView
                  estimation={estimation}
                  profile={profile}
                  onCTAClick={handleCTA}
                  onReset={reset}
                />
              ) : (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-base font-semibold text-foreground mb-4 text-center">
                    {stepTitles[step as keyof typeof stepTitles]}
                  </h3>
                  <div className="space-y-2">
                    {stepOptions[step as keyof typeof stepOptions].map(option => {
                      const Icon = "icon" in option ? option.icon : null;
                      return (
                        <button
                          key={String(option.value)}
                          onClick={() => handleSelect(option.value)}
                          className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all text-left group"
                        >
                          {Icon && (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-foreground flex-1">{option.label}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                  {step === 4 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Estimation indicative — aucune donnée transmise à ce stade.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default SavingsCalculator;
