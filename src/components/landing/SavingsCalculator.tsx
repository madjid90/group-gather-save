import { useState, memo, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Home, Building2, Flame, Zap, Wifi, ChevronLeft, Calculator, TrendingDown, Sparkles, Snowflake, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { trackClick } from "@/hooks/useClickTracking";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

type Step = 1 | 2 | 3 | 4 | 5 | "result";

interface CalculatorProfile {
  logement: "appartement" | "maison" | null;
  surface: "moins_60" | "60_100" | "plus_100" | null;
  chauffage: "electrique" | "gaz" | "pompe_chaleur" | "fioul" | "collectif" | "autre" | null;
  facture: "moins_80" | "80_120" | "plus_120" | "inconnu" | null;
  internet: boolean;
}

interface EstimationResult {
  minEconomie: number;
  maxEconomie: number;
  explication: string;
}

// Options alignées avec FormulaireLogement.tsx
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
    { value: "moins_80", label: "Moins de 80 € / mois" },
    { value: "80_120", label: "80 à 120 € / mois" },
    { value: "plus_120", label: "Plus de 120 € / mois" },
    { value: "inconnu", label: "Je ne sais pas" },
  ],
  5: [
    { value: true, label: "Oui, estimer aussi Internet", icon: Wifi },
    { value: false, label: "Non, uniquement énergie" },
  ],
};

const stepTitles = {
  1: "Quel est votre type de logement ?",
  2: "Quelle est la surface de votre logement ?",
  3: "Quel est votre mode de chauffage principal ?",
  4: "Estimez votre facture mensuelle d'énergie",
  5: "Souhaitez-vous aussi estimer vos économies Internet ?",
};

// Comparison Chart Component
const ComparisonChart = memo(function ComparisonChart({ 
  profile, 
  savings 
}: { 
  profile: CalculatorProfile; 
  savings: number;
}) {
  // Estimate annual bill based on profile
  const estimatedAnnualBill = useMemo(() => {
    let bill = 1200; // Base annual bill
    
    if (profile.logement === "maison") bill += 400;
    if (profile.surface === "60_100") bill += 300;
    else if (profile.surface === "plus_100") bill += 600;
    if (profile.chauffage === "electrique") bill += 200;
    else if (profile.chauffage === "gaz") bill += 350;
    if (profile.facture === "80_120") bill = Math.max(bill, 1200);
    else if (profile.facture === "plus_120") bill = Math.max(bill, 1800);
    if (profile.internet) bill += 480; // ~40€/month
    
    return bill;
  }, [profile]);

  const afterBill = estimatedAnnualBill - savings;
  const savingsPercent = Math.round((savings / estimatedAnnualBill) * 100);
  const maxBill = estimatedAnnualBill;

  return (
    <div className="bg-muted/50 rounded-xl p-4 md:p-6 mb-6">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground mb-4">
        <TrendingDown className="w-4 h-4 text-primary" />
        Comparaison avant / après
      </div>
      
      <div className="space-y-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Aujourd'hui (estimé)</span>
            <span className="font-semibold text-foreground">{estimatedAnnualBill.toLocaleString()}€/an</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-destructive/60 rounded-full"
            />
          </div>
        </div>
        
        {/* After */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Avec Switchly</span>
            <span className="font-semibold text-primary">{afterBill.toLocaleString()}€/an</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(afterBill / maxBill) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </div>
      
      {/* Savings highlight */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Soit</span>
        <span className="text-lg font-bold text-primary">-{savingsPercent}%</span>
        <span className="text-sm text-muted-foreground">sur vos factures</span>
      </div>
    </div>
  );
});

// Result View Component with Confetti
const ResultView = memo(function ResultView({
  estimation,
  profile,
  onCTAClick,
  onReset
}: {
  estimation: EstimationResult;
  profile: CalculatorProfile;
  onCTAClick: () => void;
  onReset: () => void;
}) {
  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    // Initial burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors
    });

    frame();
  }, []);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      {/* Celebration Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
      >
        <Sparkles className="w-4 h-4" />
        Félicitations ! Voici vos économies potentielles
      </motion.div>

      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
        Votre estimation d'économies
      </h3>
      
      {/* Savings Range */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-hero rounded-2xl p-6 md:p-8 mb-4"
      >
        <p className="text-primary-foreground/80 text-sm mb-2">Économies estimées par an</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl md:text-5xl font-bold text-primary-foreground">
            {estimation.minEconomie}€
          </span>
          <span className="text-2xl text-primary-foreground/70">à</span>
          <span className="text-4xl md:text-5xl font-bold text-primary-foreground">
            {estimation.maxEconomie}€
          </span>
        </div>
      </motion.div>

      {/* Immediate CTA - Above the fold */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full md:w-auto px-8 shadow-lg"
          onClick={onCTAClick}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Rejoindre l'achat groupé
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Gratuit • Sans engagement • 30 secondes
        </p>
      </motion.div>

      {/* Before/After Comparison Chart */}
      <ComparisonChart 
        profile={profile} 
        savings={(estimation.minEconomie + estimation.maxEconomie) / 2} 
      />

      {/* Explanation */}
      <p className="text-muted-foreground text-sm md:text-base mb-4">
        {estimation.explication}
      </p>

      <p className="text-xs text-muted-foreground/70 mb-6">
        Estimation indicative basée sur des profils comparables. Aucune action sans votre accord.
      </p>

      {/* Secondary CTA */}
      <Button 
        variant="outline" 
        size="lg" 
        className="w-full md:w-auto px-8 mb-4"
        onClick={onCTAClick}
      >
        Recevoir mon offre personnalisée
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <button 
        onClick={onReset}
        className="block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Refaire le calcul
      </button>
    </motion.div>
  );
});

export const SavingsCalculator = memo(function SavingsCalculator() {
  const [step, setStep] = useState<Step>(1);
  const [profile, setProfile] = useState<CalculatorProfile>({
    logement: null,
    surface: null,
    chauffage: null,
    facture: null,
    internet: false,
  });
  const [estimation, setEstimation] = useState<EstimationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = async (value: any) => {
    const newProfile = { ...profile };
    
    switch (step) {
      case 1:
        newProfile.logement = value;
        setProfile(newProfile);
        setStep(2);
        break;
      case 2:
        newProfile.surface = value;
        setProfile(newProfile);
        setStep(3);
        break;
      case 3:
        newProfile.chauffage = value;
        setProfile(newProfile);
        setStep(4);
        break;
      case 4:
        newProfile.facture = value;
        setProfile(newProfile);
        setStep(5);
        break;
      case 5:
        newProfile.internet = value;
        setProfile(newProfile);
        // Track calculator completion
        trackClick({ eventType: 'calculator_completed', source: 'savings_calculator', metadata: { profile: newProfile } });
        await getEstimation(newProfile);
        break;
    }
  };

  const getEstimation = async (finalProfile: CalculatorProfile) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('estimate-savings', {
        body: { profile: finalProfile }
      });

      if (error) throw error;

      setEstimation(data);
      setStep("result");
      trackClick({ eventType: 'calculator_result_viewed', source: 'savings_calculator' });
    } catch (error) {
      console.error('Estimation error:', error);
      // Fallback estimation if AI fails
      const fallback = getFallbackEstimation(finalProfile);
      setEstimation(fallback);
      setStep("result");
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackEstimation = (p: CalculatorProfile): EstimationResult => {
    let min = 180;
    let max = 280;

    // Adjust based on housing type
    if (p.logement === "maison") {
      min += 70;
      max += 120;
    }

    // Adjust based on surface
    if (p.surface === "60_100") {
      min += 50;
      max += 80;
    } else if (p.surface === "plus_100") {
      min += 120;
      max += 180;
    }

    // Adjust based on heating type
    if (p.chauffage === "electrique") {
      min += 30;
      max += 50;
    } else if (p.chauffage === "gaz") {
      min += 80;
      max += 150;
    } else if (p.chauffage === "pompe_chaleur") {
      min += 40;
      max += 70;
    } else if (p.chauffage === "fioul") {
      min += 100;
      max += 180;
    } else if (p.chauffage === "collectif") {
      min -= 30;
      max -= 20;
    }

    // Adjust based on bill
    if (p.facture === "80_120") {
      min += 40;
      max += 60;
    } else if (p.facture === "plus_120") {
      min += 80;
      max += 120;
    }

    // Add internet savings
    if (p.internet) {
      min += 60;
      max += 120;
    }

    const logementLabel = p.logement === "maison" ? "une maison" : "un appartement";
    const getChauffageLabel = () => {
      switch (p.chauffage) {
        case "electrique": return "l'électricité";
        case "gaz": return "l'électricité et le gaz";
        case "pompe_chaleur": return "l'électricité (pompe à chaleur)";
        case "fioul": return "l'énergie (fioul)";
        case "collectif": return "vos charges de chauffage collectif";
        default: return "l'énergie";
      }
    };
    const internetLabel = p.internet ? " et votre box internet" : "";

    return {
      minEconomie: Math.round(min / 10) * 10,
      maxEconomie: Math.round(max / 10) * 10,
      explication: `Pour ${logementLabel} avec votre profil, vous pouvez économiser sur ${getChauffageLabel()}${internetLabel} grâce à l'achat groupé Switchly. Cette estimation est basée sur les économies réalisées par des foyers similaires.`
    };
  };

  const handleCTAClick = () => {
    trackClick({ eventType: 'calculator_cta_inscription', source: 'savings_calculator' });
    
    // Store profile in localStorage for inscription page
    const profileSummary = {
      logement: profile.logement === "maison" ? "Maison" : "Appartement",
      surface: profile.surface === "moins_60" ? "< 60 m²" : profile.surface === "60_100" ? "60-100 m²" : "> 100 m²",
      chauffage: profile.chauffage === "electrique" ? "Électrique" : 
                 profile.chauffage === "gaz" ? "Gaz" : 
                 profile.chauffage === "pompe_chaleur" ? "Pompe à chaleur" : 
                 profile.chauffage === "fioul" ? "Fioul" : 
                 profile.chauffage === "collectif" ? "Collectif" : "Autre",
      facture: profile.facture === "moins_80" ? "< 80 €/mois" : profile.facture === "80_120" ? "80-120 €/mois" : profile.facture === "plus_120" ? "> 120 €/mois" : "Facture inconnue",
      estimation: estimation,
    };
    localStorage.setItem('switchly_calculator_profile', JSON.stringify(profileSummary));
    
    navigate("/inscription");
  };

  const goBack = () => {
    if (typeof step === "number" && step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const resetCalculator = () => {
    setStep(1);
    setProfile({
      logement: null,
      surface: null,
      chauffage: null,
      facture: null,
      internet: false,
    });
    setEstimation(null);
    trackClick({ eventType: 'calculator_started', source: 'savings_calculator' });
  };

  const currentStep = typeof step === "number" ? step : 5;
  const totalSteps = 5;

  return (
    <section id="estimateur" className="py-10 md:py-14 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6 w-full">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Calculator className="w-3.5 h-3.5" />
              Estimateur d'économies
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-2">
              Combien pouvez-vous économiser ?
            </h2>
            <p className="text-sm text-muted-foreground">
              Répondez à quelques questions pour découvrir votre potentiel d'économies
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl md:rounded-3xl shadow-switchly-lg overflow-hidden"
          >
            {/* Progress Bar */}
            {step !== "result" && (
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Étape {currentStep}/{totalSteps}</span>
                  {currentStep > 1 && (
                    <button 
                      onClick={goBack}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Retour
                    </button>
                  )}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-hero rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-4 md:p-8">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground">Calcul de votre estimation...</p>
                  </motion.div>
                ) : step === "result" && estimation ? (
                  <ResultView 
                    estimation={estimation}
                    profile={profile}
                    onCTAClick={handleCTAClick}
                    onReset={resetCalculator}
                  />
                ) : (
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base md:text-xl font-semibold text-foreground mb-4 text-center">
                      {stepTitles[step as keyof typeof stepTitles]}
                    </h3>

                    <div className="space-y-2">
                      {stepOptions[step as keyof typeof stepOptions].map((option) => {
                        const Icon = 'icon' in option ? option.icon : null;
                        return (
                          <button
                            key={String(option.value)}
                            onClick={() => handleSelect(option.value)}
                            className="w-full flex items-center gap-3 p-3 md:p-5 rounded-lg border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all text-left group"
                          >
                            {Icon && (
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <span className="text-sm md:text-lg font-medium text-foreground flex-1">
                              {option.label}
                            </span>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Reassurance text */}
                    {(step === 4 || step === 5) && (
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Estimation indicative — aucune donnée n'est transmise à ce stade
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default SavingsCalculator;
