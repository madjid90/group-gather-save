import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  Ruler,
  Users,
  Flame,
  Droplets,
  Zap,
  Clock,
  Gauge,
  Euro,
  Globe,
  Radio,
  Smile,
  Cable,
  Car,
  BrickWall,
  Loader2,
  Check,
  ChevronLeft,
  Settings,
} from "lucide-react";

// Form data types
interface FormData {
  typeLogement: string;
  surface: string;
  nombreOccupants: string;
  isolation: string;
  modeChauffage: string;
  chauffeEauElectrique: string;
  fournisseurElectricite: string;
  optionTarifaire: string;
  puissanceCompteur: string;
  montantFacture: string;
  typeConnexion: string;
  fournisseurInternet: string;
  prixMensuelInternet: string;
  satisfaction: number;
  eligibiliteFibre: string;
  tempsDomicile: string;
  equipementsEnergivores: string[];
  rechargeVehicule: string;
}

// Options
const TYPES_LOGEMENT = [
  { value: "appartement", label: "Appartement" },
  { value: "maison", label: "Maison" },
  { value: "studio", label: "Studio" },
];

const ISOLATION_OPTIONS = [
  { value: "bonne", label: "Bonne (récente)" },
  { value: "moyenne", label: "Moyenne" },
  { value: "faible", label: "Faible (ancienne)" },
];

const MODES_CHAUFFAGE = [
  { value: "electrique", label: "Électrique" },
  { value: "gaz", label: "Gaz" },
  { value: "fioul", label: "Fioul" },
  { value: "pompe_chaleur", label: "Pompe à chaleur" },
  { value: "bois", label: "Bois" },
];

const FOURNISSEURS_ENERGIE = [
  { value: "edf", label: "EDF" },
  { value: "engie", label: "Engie" },
  { value: "totalenergies", label: "TotalEnergies" },
  { value: "eni", label: "Eni" },
  { value: "autre", label: "Autre" },
];

const OPTIONS_TARIFAIRES = [
  { value: "base", label: "Base" },
  { value: "hphc", label: "Heures Pleines / Heures Creuses" },
  { value: "tempo", label: "Tempo" },
  { value: "ejp", label: "EJP" },
];

const PUISSANCES_COMPTEUR = [
  { value: "3", label: "3 kVA" },
  { value: "6", label: "6 kVA" },
  { value: "9", label: "9 kVA" },
  { value: "12", label: "12 kVA" },
  { value: "15", label: "15 kVA" },
];

const TYPES_CONNEXION = [
  { value: "fibre", label: "Fibre optique" },
  { value: "adsl", label: "ADSL" },
  { value: "4g_box", label: "Box 4G/5G" },
];

const FOURNISSEURS_INTERNET = [
  { value: "orange", label: "Orange" },
  { value: "sfr", label: "SFR" },
  { value: "free", label: "Free" },
  { value: "bouygues", label: "Bouygues Telecom" },
  { value: "autre", label: "Autre" },
];

const TEMPS_DOMICILE = [
  { value: "peu", label: "Peu présent (< 8h/jour)" },
  { value: "moyen", label: "Moyennement (8-12h/jour)" },
  { value: "beaucoup", label: "Très présent (> 12h/jour)" },
  { value: "teletravail", label: "Télétravail" },
];

const EQUIPEMENTS = [
  { value: "climatisation", label: "Climatisation" },
  { value: "piscine", label: "Piscine" },
  { value: "seche_linge", label: "Sèche-linge" },
  { value: "congelateur", label: "Congélateur" },
  { value: "lave_vaisselle", label: "Lave-vaisselle" },
];

const OCCUPANTS = [
  { value: "1", label: "1 personne" },
  { value: "2", label: "2 personnes" },
  { value: "3", label: "3 personnes" },
  { value: "4", label: "4 personnes" },
  { value: "5", label: "5 personnes" },
  { value: "6", label: "6+ personnes" },
];

// Step definitions
const STEPS = [
  { id: 1, title: "Votre logement", icon: Home },
  { id: 2, title: "Contrat électricité", icon: Zap },
  { id: 3, title: "Abonnement Internet", icon: Globe },
  { id: 4, title: "Habitudes & équipements", icon: Settings },
];

// Question definitions
interface Question {
  id: string;
  step: number;
  field: keyof FormData;
  label: string;
  icon: React.ElementType;
  type: "select" | "radio" | "input" | "slider" | "checkbox";
  options?: { value: string; label: string }[];
  placeholder?: string;
  inputType?: string;
  min?: number;
  max?: number;
  autoAdvance?: boolean;
}

const QUESTIONS: Question[] = [
  // Step 1: Logement
  { id: "q1", step: 1, field: "typeLogement", label: "Pour optimiser la négociation de votre groupe, indiquez votre type de logement.", icon: Home, type: "select", options: TYPES_LOGEMENT, autoAdvance: true },
  { id: "q2", step: 1, field: "surface", label: "Pour personnaliser votre réduction groupée, indiquez la surface en m².", icon: Ruler, type: "input", placeholder: "Ex : 65", inputType: "number", autoAdvance: false },
  { id: "q3", step: 1, field: "nombreOccupants", label: "Combien de personnes vivent dans votre logement ?", icon: Users, type: "select", options: OCCUPANTS, autoAdvance: true },
  { id: "q4", step: 1, field: "isolation", label: "Comment est isolé votre logement ? Cela influence votre réduction.", icon: BrickWall, type: "select", options: ISOLATION_OPTIONS, autoAdvance: true },
  { id: "q5", step: 1, field: "modeChauffage", label: "Quel est votre mode de chauffage principal ?", icon: Flame, type: "select", options: MODES_CHAUFFAGE, autoAdvance: true },
  { id: "q6", step: 1, field: "chauffeEauElectrique", label: "Avez-vous un chauffe-eau électrique ?", icon: Droplets, type: "radio", options: [{ value: "oui", label: "Oui" }, { value: "non", label: "Non" }], autoAdvance: true },
  
  // Step 2: Électricité
  { id: "q7", step: 2, field: "fournisseurElectricite", label: "Qui est votre fournisseur d'électricité actuel ?", icon: Zap, type: "select", options: FOURNISSEURS_ENERGIE, autoAdvance: true },
  { id: "q8", step: 2, field: "optionTarifaire", label: "Quelle est votre option tarifaire ?", icon: Clock, type: "select", options: OPTIONS_TARIFAIRES, autoAdvance: true },
  { id: "q9", step: 2, field: "puissanceCompteur", label: "Quelle est la puissance de votre compteur ?", icon: Gauge, type: "select", options: PUISSANCES_COMPTEUR, autoAdvance: true },
  { id: "q10", step: 2, field: "montantFacture", label: "Combien payez-vous en moyenne par mois ? Cela nous aide à calculer votre économie dans le groupe.", icon: Euro, type: "input", placeholder: "Ex : 90 € / mois", inputType: "number", autoAdvance: false },
  
  // Step 3: Internet
  { id: "q11", step: 3, field: "typeConnexion", label: "Quel type de connexion Internet utilisez-vous ?", icon: Globe, type: "select", options: TYPES_CONNEXION, autoAdvance: true },
  { id: "q12", step: 3, field: "fournisseurInternet", label: "Qui est votre fournisseur Internet ?", icon: Radio, type: "select", options: FOURNISSEURS_INTERNET, autoAdvance: true },
  { id: "q13", step: 3, field: "prixMensuelInternet", label: "Quel est le prix de votre abonnement Internet ?", icon: Euro, type: "input", placeholder: "Ex : 29,99 € / mois", inputType: "number", autoAdvance: false },
  { id: "q14", step: 3, field: "satisfaction", label: "Êtes-vous satisfait de votre connexion ?", icon: Smile, type: "slider", min: 1, max: 5, autoAdvance: false },
  { id: "q15", step: 3, field: "eligibiliteFibre", label: "Êtes-vous éligible à la fibre ?", icon: Cable, type: "radio", options: [{ value: "oui", label: "Oui" }, { value: "non", label: "Non" }, { value: "ne_sais_pas", label: "Je ne sais pas" }], autoAdvance: true },
  
  // Step 4: Habitudes
  { id: "q16", step: 4, field: "tempsDomicile", label: "Combien de temps passez-vous à domicile ?", icon: Clock, type: "select", options: TEMPS_DOMICILE, autoAdvance: true },
  { id: "q17", step: 4, field: "equipementsEnergivores", label: "Quels équipements énergivores possédez-vous ?", icon: Settings, type: "checkbox", options: EQUIPEMENTS, autoAdvance: false },
  { id: "q18", step: 4, field: "rechargeVehicule", label: "Rechargez-vous un véhicule électrique ?", icon: Car, type: "radio", options: [{ value: "oui", label: "Oui" }, { value: "non", label: "Non" }], autoAdvance: true },
];

export default function FormulaireLogement() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    typeLogement: "",
    surface: "",
    nombreOccupants: "",
    isolation: "",
    modeChauffage: "",
    chauffeEauElectrique: "",
    fournisseurElectricite: "",
    optionTarifaire: "",
    puissanceCompteur: "",
    montantFacture: "",
    typeConnexion: "",
    fournisseurInternet: "",
    prixMensuelInternet: "",
    satisfaction: 3,
    eligibiliteFibre: "",
    tempsDomicile: "",
    equipementsEnergivores: [],
    rechargeVehicule: "",
  });

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentStep = currentQuestion?.step || 1;
  const totalQuestions = QUESTIONS.length;
  const overallProgress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc("validate_housing_token", { p_token: token });

        if (error || !data || data.length === 0) {
          setIsValidToken(false);
        } else if (data[0].form_completed) {
          setIsSuccess(true);
          setIsValidToken(true);
        } else {
          setIsValidToken(true);
        }
      } catch {
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const goToNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleChange = useCallback((field: keyof FormData, value: string | number | string[], shouldAdvance: boolean = false) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (shouldAdvance) {
      setTimeout(goToNext, 300);
    }
  }, [goToNext]);

  const handleEquipementToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      equipementsEnergivores: prev.equipementsEnergivores.includes(value)
        ? prev.equipementsEnergivores.filter((e) => e !== value)
        : [...prev.equipementsEnergivores, value],
    }));
  };

  const handleSubmit = async () => {
    if (!token) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("insert_housing_profile_with_token", {
        p_token: token,
        p_type_logement: formData.typeLogement || null,
        p_surface: formData.surface ? parseInt(formData.surface) : null,
        p_nombre_occupants: formData.nombreOccupants ? parseInt(formData.nombreOccupants) : null,
        p_isolation: formData.isolation || null,
        p_mode_chauffage: formData.modeChauffage || null,
        p_chauffe_eau_electrique: formData.chauffeEauElectrique === "oui",
        p_fournisseur_electricite: formData.fournisseurElectricite || null,
        p_option_tarifaire: formData.optionTarifaire || null,
        p_puissance_compteur: formData.puissanceCompteur || null,
        p_montant_facture: formData.montantFacture ? parseFloat(formData.montantFacture) : null,
        p_type_connexion: formData.typeConnexion || null,
        p_fournisseur_internet: formData.fournisseurInternet || null,
        p_prix_mensuel_internet: formData.prixMensuelInternet ? parseFloat(formData.prixMensuelInternet) : null,
        p_satisfaction_internet: formData.satisfaction,
        p_eligible_fibre: formData.eligibiliteFibre === "oui",
        p_temps_domicile: formData.tempsDomicile || null,
        p_equipements_energivores: formData.equipementsEnergivores,
        p_recharge_vehicule_electrique: formData.rechargeVehicule === "oui",
      });

      if (error) throw error;
      if (!data) throw new Error("Token invalide");

      // Send form completed SMS automatically
      try {
        // Get user ID from token to send SMS
        const { data: tokenData } = await supabase.rpc("validate_housing_token", { p_token: token });
        if (tokenData && tokenData[0]?.user_id) {
          await supabase.functions.invoke("send-form-completed-sms", {
            body: { userId: tokenData[0].user_id },
          });
        }
      } catch (smsError) {
        console.log("Form completed SMS not sent:", smsError);
      }

      setIsSuccess(true);
      toast.success("Informations enregistrées avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleNextOrSubmit = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      goToNext();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
        <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-switchly-xl border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Lien invalide</h1>
          <p className="text-muted-foreground mb-6">
            Ce lien n'est pas valide ou a expiré. Veuillez vous inscrire pour recevoir un nouveau lien.
          </p>
          <Button variant="hero" asChild>
            <Link to="/inscription">S'inscrire</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-3xl p-8 shadow-switchly-xl border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Merci ! 🚀</h1>
          <p className="text-muted-foreground mb-6">
            Vous faites officiellement partie de l'achat groupé. Nous négocions une réduction pouvant atteindre -30 % selon votre profil.
          </p>
          <Button variant="hero" asChild>
            <Link to="/dashboard-client">Accéder à mon espace</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const renderQuestion = (question: Question) => {
    const Icon = question.icon;
    const value = formData[question.field];

    return (
      <div className="flex flex-col items-center justify-center min-h-[45vh] px-4 py-4">
        {/* Question Label */}
        <div className="text-center mb-5 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
            {question.label}
          </h2>
        </div>

        {/* Answer Input */}
        <div className="w-full max-w-sm">
          {question.type === "select" && question.options && (
            <div className="grid gap-2.5">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange(question.field, option.value, question.autoAdvance)}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                    value === option.value
                      ? "border-primary bg-primary/10 text-foreground shadow-sm"
                      : "border-border bg-card hover:border-primary/50 text-foreground"
                  }`}
                >
                  <span className="font-medium text-base">{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === "radio" && question.options && (
            <RadioGroup
              value={value as string}
              onValueChange={(v) => handleChange(question.field, v, question.autoAdvance)}
              className="grid gap-2.5"
            >
              {question.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 w-full min-h-[52px] px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                    value === option.value
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer font-medium text-base flex-1">
                    {option.label}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          )}

          {question.type === "input" && (
            <div className="space-y-4">
              <Input
                type={question.inputType || "text"}
                value={value as string}
                onChange={(e) => handleChange(question.field, e.target.value)}
                placeholder={question.placeholder}
                className="text-lg h-14 text-center rounded-xl border-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && value) {
                    e.preventDefault();
                    goToNext();
                  }
                }}
              />
              <Button
                type="button"
                variant="hero"
                size="xl"
                className="w-full"
                onClick={goToNext}
                disabled={!value}
              >
                Continuer
              </Button>
            </div>
          )}

          {question.type === "slider" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Pas satisfait</span>
                <span>Très satisfait</span>
              </div>
              <Slider
                value={[value as number]}
                onValueChange={(v) => handleChange(question.field, v[0])}
                min={question.min || 1}
                max={question.max || 5}
                step={1}
                className="py-4"
              />
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleChange(question.field, n)}
                    className={`w-11 h-11 rounded-full text-base font-semibold transition-all active:scale-95 ${
                      value === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/20"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="hero"
                size="xl"
                className="w-full"
                onClick={goToNext}
              >
                Continuer
              </Button>
            </div>
          )}

          {question.type === "checkbox" && question.options && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {question.options.map((option) => {
                  const isChecked = (value as string[]).includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2.5 min-h-[52px] px-3 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                        isChecked
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleEquipementToggle(option.value)}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Sélectionnez vos équipements
              </p>
              <Button
                type="button"
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleNextOrSubmit}
              >
                {isLastQuestion ? "Valider" : "Continuer"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Logo + Progress inline */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-foreground">Switchly</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>

          {/* Step indicators - compact for mobile */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    isActive
                      ? "bg-primary"
                      : isCompleted
                      ? "bg-secondary"
                      : "bg-muted"
                  }`}
                />
              );
            })}
          </div>

          {/* Progress bar */}
          <Progress value={overallProgress} className="h-1" />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestionIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1"
          >
            {renderQuestion(currentQuestion)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-lg mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className="text-muted-foreground px-3"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Retour</span>
          </Button>

          <Link
            to="/dashboard-client"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Quitter
          </Link>

          {isLastQuestion && currentQuestion.type !== "checkbox" && (
            <Button
              type="button"
              variant="hero"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span className="hidden sm:inline">Enregistrement...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Valider</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
