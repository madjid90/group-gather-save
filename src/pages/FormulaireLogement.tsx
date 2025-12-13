import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Upload,
  Shield,
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
  factureFile: File | null;
  typeConnexion: string;
  fournisseurInternet: string;
  prixMensuelInternet: string;
  satisfaction: string;
  eligibiliteFibre: string;
  tempsDomicile: string;
  equipementsEnergivores: string[];
  rechargeVehicule: string;
}

// Options - Updated according to user specifications
const TYPES_LOGEMENT = [
  { value: "appartement", label: "Appartement" },
  { value: "maison", label: "Maison" },
];

const OCCUPANTS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5 et +" },
];

const ISOLATION_OPTIONS = [
  { value: "tres_bonne", label: "Très bonne" },
  { value: "moyenne", label: "Moyenne" },
  { value: "mauvaise", label: "Mauvaise" },
  { value: "ne_sais_pas", label: "Je ne sais pas" },
];

const MODES_CHAUFFAGE = [
  { value: "electrique", label: "Électrique" },
  { value: "gaz", label: "Gaz" },
  { value: "pompe_chaleur", label: "Pompe à chaleur" },
  { value: "fioul", label: "Fioul" },
  { value: "autre", label: "Autre" },
];

const CHAUFFE_EAU_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
  { value: "ne_sais_pas", label: "Je ne sais pas" },
];

const FOURNISSEURS_ENERGIE = [
  { value: "edf", label: "EDF" },
  { value: "engie", label: "Engie" },
  { value: "totalenergies", label: "TotalEnergies" },
  { value: "ohm_energie", label: "Ohm Énergie" },
  { value: "ekwateur", label: "Ekwateur" },
  { value: "autre", label: "Autre" },
];

const OPTIONS_TARIFAIRES = [
  { value: "base", label: "Base" },
  { value: "hphc", label: "Heures pleines / Heures creuses" },
  { value: "tempo", label: "Tempo" },
  { value: "ne_sais_pas", label: "Je ne sais pas" },
];

const PUISSANCES_COMPTEUR = [
  { value: "3", label: "3 kVA" },
  { value: "6", label: "6 kVA" },
  { value: "9", label: "9 kVA" },
  { value: "12", label: "12 kVA" },
  { value: "15", label: "15 kVA" },
  { value: "18", label: "18 kVA" },
  { value: "ne_sais_pas", label: "Je ne sais pas" },
];

const TYPES_CONNEXION = [
  { value: "adsl", label: "ADSL" },
  { value: "fibre", label: "Fibre" },
  { value: "4g_box", label: "4G Box" },
  { value: "ne_sais_pas", label: "Je ne sais pas" },
];

const FOURNISSEURS_INTERNET = [
  { value: "orange", label: "Orange" },
  { value: "sfr", label: "SFR" },
  { value: "bouygues", label: "Bouygues" },
  { value: "free", label: "Free" },
  { value: "autre", label: "Autre" },
];

const SATISFACTION_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
  { value: "moyennement", label: "Moyennement" },
];

const ELIGIBILITE_FIBRE_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
  { value: "ne_sais_pas", label: "Je ne sais pas" },
];

const TEMPS_DOMICILE = [
  { value: "souvent", label: "Souvent" },
  { value: "peu", label: "Peu" },
  { value: "variable", label: "Variable" },
];

const EQUIPEMENTS = [
  { value: "climatisation", label: "Climatisation" },
  { value: "pompe_chaleur", label: "Pompe à chaleur" },
  { value: "congelateur", label: "Congélateur indépendant" },
  { value: "piscine", label: "Piscine" },
  { value: "voiture_electrique", label: "Voiture électrique" },
];

const RECHARGE_OPTIONS = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
];

// Step definitions
const STEPS = [
  { id: 1, title: "Votre logement", icon: Home },
  { id: 2, title: "Contrat électricité", icon: Zap },
  { id: 3, title: "Internet", icon: Globe },
  { id: 4, title: "Habitudes & équipements", icon: Settings },
];

// Question definitions with micro-texts
interface Question {
  id: string;
  step: number;
  field: keyof FormData;
  label: string;
  microText: string;
  icon: React.ElementType;
  type: "select" | "radio" | "input" | "checkbox" | "upload";
  options?: { value: string; label: string }[];
  placeholder?: string;
  inputType?: string;
  autoAdvance?: boolean;
}

const QUESTIONS: Question[] = [
  // ÉTAPE 1 — VOTRE LOGEMENT
  {
    id: "q1",
    step: 1,
    field: "typeLogement",
    label: "Type de logement",
    microText: "Cette information nous aide à estimer votre consommation globale.",
    icon: Home,
    type: "select",
    options: TYPES_LOGEMENT,
    autoAdvance: true,
  },
  {
    id: "q2",
    step: 1,
    field: "surface",
    label: "Surface du logement (en m²)",
    microText: "La surface permet d'estimer précisément vos besoins énergétiques.",
    icon: Ruler,
    type: "input",
    placeholder: "Ex : 65",
    inputType: "number",
    autoAdvance: false,
  },
  {
    id: "q3",
    step: 1,
    field: "nombreOccupants",
    label: "Nombre de personnes dans le logement",
    microText: "Plus le foyer est nombreux, plus les usages énergétiques varient.",
    icon: Users,
    type: "select",
    options: OCCUPANTS,
    autoAdvance: true,
  },
  {
    id: "q4",
    step: 1,
    field: "isolation",
    label: "Niveau d'isolation du logement",
    microText: "Si vous n'êtes pas sûr, choisissez « Je ne sais pas ».",
    icon: BrickWall,
    type: "select",
    options: ISOLATION_OPTIONS,
    autoAdvance: true,
  },
  {
    id: "q5",
    step: 1,
    field: "modeChauffage",
    label: "Mode de chauffage principal",
    microText: "Le chauffage représente la plus grande part de la consommation.",
    icon: Flame,
    type: "select",
    options: MODES_CHAUFFAGE,
    autoAdvance: true,
  },
  {
    id: "q6",
    step: 1,
    field: "chauffeEauElectrique",
    label: "Chauffe-eau électrique",
    microText: "Cette information améliore la précision de l'offre.",
    icon: Droplets,
    type: "radio",
    options: CHAUFFE_EAU_OPTIONS,
    autoAdvance: true,
  },

  // ÉTAPE 2 — VOTRE CONTRAT D'ÉLECTRICITÉ ACTUEL
  {
    id: "q7",
    step: 2,
    field: "fournisseurElectricite",
    label: "Fournisseur d'électricité actuel",
    microText: "Nous comparons votre contrat actuel avec les offres négociées.",
    icon: Zap,
    type: "select",
    options: FOURNISSEURS_ENERGIE,
    autoAdvance: true,
  },
  {
    id: "q8",
    step: 2,
    field: "optionTarifaire",
    label: "Option tarifaire",
    microText: "Vous pouvez vérifier cette information sur votre facture.",
    icon: Clock,
    type: "select",
    options: OPTIONS_TARIFAIRES,
    autoAdvance: true,
  },
  {
    id: "q9",
    step: 2,
    field: "puissanceCompteur",
    label: "Puissance du compteur (kVA)",
    microText: "Une puissance adaptée permet d'éviter de payer trop cher.",
    icon: Gauge,
    type: "select",
    options: PUISSANCES_COMPTEUR,
    autoAdvance: true,
  },
  {
    id: "q10",
    step: 2,
    field: "montantFacture",
    label: "Montant moyen de votre facture d'électricité",
    microText: "Une estimation suffit, inutile d'être exact.",
    icon: Euro,
    type: "input",
    placeholder: "Ex : 90 €/mois",
    inputType: "text",
    autoAdvance: false,
  },
  {
    id: "q11",
    step: 2,
    field: "factureFile",
    label: "Télécharger une facture d'électricité (optionnel)",
    microText: "Facultatif. Cela nous permet d'affiner encore plus votre offre.",
    icon: Upload,
    type: "upload",
    autoAdvance: false,
  },

  // ÉTAPE 3 — INTERNET
  {
    id: "q12",
    step: 3,
    field: "typeConnexion",
    label: "Type de connexion Internet",
    microText: "La technologie disponible influence fortement le prix.",
    icon: Globe,
    type: "select",
    options: TYPES_CONNEXION,
    autoAdvance: true,
  },
  {
    id: "q13",
    step: 3,
    field: "fournisseurInternet",
    label: "Fournisseur Internet actuel",
    microText: "Nous comparons votre abonnement avec les meilleures offres du marché.",
    icon: Radio,
    type: "select",
    options: FOURNISSEURS_INTERNET,
    autoAdvance: true,
  },
  {
    id: "q14",
    step: 3,
    field: "prixMensuelInternet",
    label: "Prix mensuel actuel de votre abonnement Internet",
    microText: "Indiquez le prix hors options si possible.",
    icon: Euro,
    type: "input",
    placeholder: "Ex : 29,99 €/mois",
    inputType: "text",
    autoAdvance: false,
  },
  {
    id: "q15",
    step: 3,
    field: "satisfaction",
    label: "Êtes-vous satisfait(e) de votre connexion actuelle ?",
    microText: "Cela nous aide à proposer une alternative plus adaptée.",
    icon: Smile,
    type: "radio",
    options: SATISFACTION_OPTIONS,
    autoAdvance: true,
  },
  {
    id: "q16",
    step: 3,
    field: "eligibiliteFibre",
    label: "Êtes-vous éligible à la fibre ?",
    microText: "Si vous ne savez pas, sélectionnez « Je ne sais pas ».",
    icon: Cable,
    type: "radio",
    options: ELIGIBILITE_FIBRE_OPTIONS,
    autoAdvance: true,
  },

  // ÉTAPE 4 — HABITUDES & ÉQUIPEMENTS
  {
    id: "q17",
    step: 4,
    field: "tempsDomicile",
    label: "Temps passé à domicile",
    microText: "Le temps de présence impacte directement la consommation.",
    icon: Clock,
    type: "select",
    options: TEMPS_DOMICILE,
    autoAdvance: true,
  },
  {
    id: "q18",
    step: 4,
    field: "equipementsEnergivores",
    label: "Équipements énergivores présents",
    microText: "Ces équipements influencent fortement les besoins énergétiques.",
    icon: Settings,
    type: "checkbox",
    options: EQUIPEMENTS,
    autoAdvance: false,
  },
  {
    id: "q19",
    step: 4,
    field: "rechargeVehicule",
    label: "Recharge de véhicule électrique à domicile",
    microText: "Cela permet de proposer une offre adaptée à la recharge.",
    icon: Car,
    type: "radio",
    options: RECHARGE_OPTIONS,
    autoAdvance: true,
  },
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
    factureFile: null,
    typeConnexion: "",
    fournisseurInternet: "",
    prixMensuelInternet: "",
    satisfaction: "",
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
        const { data, error } = await supabase.rpc("validate_housing_token", {
          p_token: token,
        });

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
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleChange = useCallback(
    (
      field: keyof FormData,
      value: string | number | string[] | File | null,
      shouldAdvance: boolean = false
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (shouldAdvance) {
        setTimeout(goToNext, 300);
      }
    },
    [goToNext]
  );

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
      // Parse montant facture - extract number from string like "90 €/mois"
      const montantMatch = formData.montantFacture.match(/[\d.,]+/);
      const montantValue = montantMatch
        ? parseFloat(montantMatch[0].replace(",", "."))
        : null;

      // Parse prix internet - extract number from string like "29,99 €/mois"
      const prixInternetMatch = formData.prixMensuelInternet.match(/[\d.,]+/);
      const prixInternetValue = prixInternetMatch
        ? parseFloat(prixInternetMatch[0].replace(",", "."))
        : null;

      // Map satisfaction to numeric value for database
      const satisfactionMap: { [key: string]: number } = {
        oui: 5,
        moyennement: 3,
        non: 1,
      };

      const { data, error } = await supabase.rpc(
        "insert_housing_profile_with_token",
        {
          p_token: token,
          p_type_logement: formData.typeLogement || null,
          p_surface: formData.surface ? parseInt(formData.surface) : null,
          p_nombre_occupants: formData.nombreOccupants
            ? parseInt(formData.nombreOccupants)
            : null,
          p_isolation: formData.isolation || null,
          p_mode_chauffage: formData.modeChauffage || null,
          p_chauffe_eau_electrique:
            formData.chauffeEauElectrique === "oui"
              ? true
              : formData.chauffeEauElectrique === "non"
              ? false
              : null,
          p_fournisseur_electricite: formData.fournisseurElectricite || null,
          p_option_tarifaire: formData.optionTarifaire || null,
          p_puissance_compteur: formData.puissanceCompteur || null,
          p_montant_facture: montantValue,
          p_type_connexion: formData.typeConnexion || null,
          p_fournisseur_internet: formData.fournisseurInternet || null,
          p_prix_mensuel_internet: prixInternetValue,
          p_satisfaction_internet:
            satisfactionMap[formData.satisfaction] || null,
          p_eligible_fibre:
            formData.eligibiliteFibre === "oui"
              ? true
              : formData.eligibiliteFibre === "non"
              ? false
              : null,
          p_temps_domicile: formData.tempsDomicile || null,
          p_equipements_energivores: formData.equipementsEnergivores,
          p_recharge_vehicule_electrique: formData.rechargeVehicule === "oui",
        }
      );

      if (error) throw error;
      if (!data) throw new Error("Token invalide");

      // Send form completed SMS automatically
      try {
        const { data: tokenData } = await supabase.rpc(
          "validate_housing_token",
          { p_token: token }
        );
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
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Lien invalide
          </h1>
          <p className="text-muted-foreground mb-6">
            Ce lien n'est pas valide ou a expiré. Veuillez vous inscrire pour
            recevoir un nouveau lien.
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
            Vous faites officiellement partie de l'achat groupé. Nous négocions
            une réduction pouvant atteindre -30 % selon votre profil.
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
          <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug mb-2">
            {question.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            {question.microText}
          </p>
        </div>

        {/* Answer Input */}
        <div className="w-full max-w-sm">
          {question.type === "select" && question.options && (
            <div className="grid gap-2.5">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleChange(question.field, option.value, question.autoAdvance)
                  }
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
              onValueChange={(v) =>
                handleChange(question.field, v, question.autoAdvance)
              }
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
                  <Label
                    htmlFor={option.value}
                    className="cursor-pointer font-medium text-base flex-1"
                  >
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

          {question.type === "upload" && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full min-h-[120px] px-4 py-6 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary/50 cursor-pointer transition-all">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">
                  {formData.factureFile
                    ? formData.factureFile.name
                    : "Cliquez pour télécharger une facture"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleChange("factureFile", file);
                  }}
                />
              </label>
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
              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((option) => {
                  const isChecked = (value as string[]).includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 min-h-[52px] px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                        isChecked
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleEquipementToggle(option.value)}
                      />
                      <span className="font-medium text-base">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Plusieurs choix possibles
              </p>
              <Button
                type="button"
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleNextOrSubmit}
              >
                {isLastQuestion ? "Je valide mes informations" : "Continuer"}
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
              <span className="text-base font-bold text-foreground">
                Switchly
              </span>
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
        <div className="max-w-lg mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2 mb-2">
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

            {isLastQuestion &&
              currentQuestion.type !== "checkbox" && (
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
                      <span className="hidden sm:inline">
                        Je valide mes informations
                      </span>
                    </>
                  )}
                </Button>
              )}
          </div>

          {/* Security message for final step */}
          {isLastQuestion && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>
                Vos données sont sécurisées et utilisées uniquement pour
                négocier votre offre.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
