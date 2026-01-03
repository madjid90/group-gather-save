import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Home, Building2, Flame, Zap, Wifi, ChevronLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { trackClick } from "@/hooks/useClickTracking";
import { supabase } from "@/integrations/supabase/client";

type Step = 1 | 2 | 3 | 4 | 5 | "result";

interface CalculatorProfile {
  logement: "appartement" | "maison" | null;
  surface: "moins_60" | "60_100" | "plus_100" | null;
  chauffage: "electrique" | "gaz" | "autre" | null;
  facture: "moins_80" | "80_120" | "plus_120" | "inconnu" | null;
  internet: boolean;
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
    { value: false, label: "Non, uniquement électricité" },
  ],
};

const stepTitles = {
  1: "Quel est votre type de logement ?",
  2: "Quelle est la surface de votre logement ?",
  3: "Quel est votre mode de chauffage principal ?",
  4: "Estimez votre facture mensuelle d'électricité",
  5: "Souhaitez-vous aussi estimer vos économies Internet ?",
};

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
    let min = 150;
    let max = 280;

    // Adjust based on housing type
    if (p.logement === "maison") {
      min += 50;
      max += 100;
    }

    // Adjust based on surface
    if (p.surface === "60_100") {
      min += 40;
      max += 60;
    } else if (p.surface === "plus_100") {
      min += 100;
      max += 150;
    }

    // Adjust based on heating
    if (p.chauffage === "electrique") {
      min += 30;
      max += 50;
    } else if (p.chauffage === "gaz") {
      min -= 20;
      max -= 30;
    }

    // Adjust based on bill
    if (p.facture === "80_120") {
      min += 30;
      max += 40;
    } else if (p.facture === "plus_120") {
      min += 60;
      max += 80;
    }

    // Add internet savings
    if (p.internet) {
      min += 60;
      max += 120;
    }

    const logementLabel = p.logement === "maison" ? "une maison" : "un appartement";
    const chauffageLabel = p.chauffage === "electrique" ? "électrique" : p.chauffage === "gaz" ? "au gaz" : "";

    return {
      minEconomie: Math.round(min / 10) * 10,
      maxEconomie: Math.round(max / 10) * 10,
      explication: `Pour ${logementLabel} ${chauffageLabel ? `avec chauffage ${chauffageLabel}` : ""}, les foyers similaires économisent généralement entre ${min}€ et ${max}€ par an grâce à l'achat groupé.${p.internet ? " L'estimation inclut également les économies Internet potentielles." : ""}`
    };
  };

  const handleCTAClick = () => {
    trackClick({ eventType: 'calculator_cta_inscription', source: 'savings_calculator' });
    
    // Store profile in localStorage for inscription page
    const profileSummary = {
      logement: profile.logement === "maison" ? "Maison" : "Appartement",
      surface: profile.surface === "moins_60" ? "< 60 m²" : profile.surface === "60_100" ? "60-100 m²" : "> 100 m²",
      chauffage: profile.chauffage === "electrique" ? "Chauffage électrique" : profile.chauffage === "gaz" ? "Chauffage gaz" : "Autre chauffage",
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
    <section id="estimateur" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Estimateur d'économies
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Combien pouvez-vous économiser ?
            </h2>
            <p className="text-muted-foreground">
              Répondez à quelques questions pour découvrir votre potentiel d'économies
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl md:rounded-3xl shadow-switchly-lg overflow-hidden"
          >
            {/* Progress Bar */}
            {step !== "result" && (
              <div className="px-6 pt-6">
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
            <div className="p-6 md:p-8">
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
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                      Votre estimation d'économies
                    </h3>
                    
                    {/* Savings Range */}
                    <div className="bg-gradient-hero rounded-2xl p-6 md:p-8 mb-6">
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
                    </div>

                    {/* Explanation */}
                    <p className="text-muted-foreground text-sm md:text-base mb-4">
                      {estimation.explication}
                    </p>

                    <p className="text-xs text-muted-foreground/70 mb-8">
                      Estimation indicative basée sur des profils comparables et des données publiques. Aucune action ne sera effectuée sans votre accord.
                    </p>

                    {/* CTA */}
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full md:w-auto px-8"
                      onClick={handleCTAClick}
                    >
                      Recevoir mon offre personnalisée
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      Gratuit • Sans engagement • 30 secondes
                    </p>

                    <button 
                      onClick={resetCalculator}
                      className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                    >
                      Refaire le calcul
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6 text-center">
                      {stepTitles[step as keyof typeof stepTitles]}
                    </h3>

                    <div className="space-y-3">
                      {stepOptions[step as keyof typeof stepOptions].map((option) => {
                        const Icon = 'icon' in option ? option.icon : null;
                        return (
                          <button
                            key={String(option.value)}
                            onClick={() => handleSelect(option.value)}
                            className="w-full flex items-center gap-4 p-4 md:p-5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all text-left group"
                          >
                            {Icon && (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <span className="text-base md:text-lg font-medium text-foreground flex-1">
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
