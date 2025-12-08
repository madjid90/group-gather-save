import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileUp,
  Globe,
  Radio,
  Smile,
  Cable,
  Car,
  BrickWall,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
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
  { value: "climatisation", label: "Climatisation", icon: Flame },
  { value: "piscine", label: "Piscine", icon: Droplets },
  { value: "seche_linge", label: "Sèche-linge", icon: Flame },
  { value: "congelateur", label: "Congélateur", icon: Zap },
  { value: "lave_vaisselle", label: "Lave-vaisselle", icon: Droplets },
];

export default function FormulaireLogement() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the security definer function to validate token
        const { data, error } = await supabase
          .rpc("validate_housing_token", { p_token: token });

        if (error || !data || data.length === 0) {
          setIsValidToken(false);
        } else if (data[0].form_completed) {
          setIsSuccess(true);
          setIsValidToken(true);
        } else {
          setIsValidToken(true);
          setUserId(data[0].user_id);
        }
      } catch {
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (field: keyof FormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEquipementToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      equipementsEnergivores: prev.equipementsEnergivores.includes(value)
        ? prev.equipementsEnergivores.filter((e) => e !== value)
        : [...prev.equipementsEnergivores, value],
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);

    try {
      // Use the security definer function to insert housing profile
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

      setIsSuccess(true);
      toast.success("Informations enregistrées avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
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
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-3xl p-8 shadow-switchly-xl border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Merci !</h1>
          <p className="text-muted-foreground mb-6">
            Vos informations ont bien été enregistrées. Nous vous préviendrons dès qu'une offre négociée sera disponible.
          </p>
          <Button variant="outline" asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Switchly</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Complétez vos informations logement
          </h1>
          <p className="text-sm text-muted-foreground">
            Ces informations nous permettent de négocier une offre adaptée. Temps estimé : 30 secondes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Étape {currentStep}/{totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Logement */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-6 border border-border space-y-5"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Votre logement
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    Type de logement
                  </Label>
                  <Select value={formData.typeLogement} onValueChange={(v) => handleChange("typeLogement", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {TYPES_LOGEMENT.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    Surface (m²)
                  </Label>
                  <Input
                    type="number"
                    value={formData.surface}
                    onChange={(e) => handleChange("surface", e.target.value)}
                    placeholder="Ex: 75"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Nombre d'occupants
                  </Label>
                  <Select value={formData.nombreOccupants} onValueChange={(v) => handleChange("nombreOccupants", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "personne" : "personnes"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <BrickWall className="w-4 h-4 text-muted-foreground" />
                    Isolation
                  </Label>
                  <Select value={formData.isolation} onValueChange={(v) => handleChange("isolation", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {ISOLATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-muted-foreground" />
                    Mode de chauffage
                  </Label>
                  <Select value={formData.modeChauffage} onValueChange={(v) => handleChange("modeChauffage", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {MODES_CHAUFFAGE.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    Chauffe-eau électrique ?
                  </Label>
                  <RadioGroup
                    value={formData.chauffeEauElectrique}
                    onValueChange={(v) => handleChange("chauffeEauElectrique", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="chauffe-oui" />
                      <Label htmlFor="chauffe-oui" className="cursor-pointer">Oui</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="chauffe-non" />
                      <Label htmlFor="chauffe-non" className="cursor-pointer">Non</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Électricité */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-6 border border-border space-y-5"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Contrat d'électricité
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    Fournisseur actuel
                  </Label>
                  <Select value={formData.fournisseurElectricite} onValueChange={(v) => handleChange("fournisseurElectricite", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {FOURNISSEURS_ENERGIE.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Option tarifaire
                  </Label>
                  <Select value={formData.optionTarifaire} onValueChange={(v) => handleChange("optionTarifaire", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {OPTIONS_TARIFAIRES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    Puissance compteur
                  </Label>
                  <Select value={formData.puissanceCompteur} onValueChange={(v) => handleChange("puissanceCompteur", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {PUISSANCES_COMPTEUR.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    Montant facture mensuel (€)
                  </Label>
                  <Input
                    type="number"
                    value={formData.montantFacture}
                    onChange={(e) => handleChange("montantFacture", e.target.value)}
                    placeholder="Ex: 120"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Internet */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-6 border border-border space-y-5"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Internet
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Type de connexion
                  </Label>
                  <Select value={formData.typeConnexion} onValueChange={(v) => handleChange("typeConnexion", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {TYPES_CONNEXION.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Radio className="w-4 h-4 text-muted-foreground" />
                    Fournisseur Internet
                  </Label>
                  <Select value={formData.fournisseurInternet} onValueChange={(v) => handleChange("fournisseurInternet", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {FOURNISSEURS_INTERNET.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    Prix mensuel (€)
                  </Label>
                  <Input
                    type="number"
                    value={formData.prixMensuelInternet}
                    onChange={(e) => handleChange("prixMensuelInternet", e.target.value)}
                    placeholder="Ex: 35"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Smile className="w-4 h-4 text-muted-foreground" />
                    Satisfaction (1 à 5)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[formData.satisfaction]}
                      onValueChange={(v) => handleChange("satisfaction", v[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-6 text-center">{formData.satisfaction}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Cable className="w-4 h-4 text-muted-foreground" />
                    Éligible fibre ?
                  </Label>
                  <RadioGroup
                    value={formData.eligibiliteFibre}
                    onValueChange={(v) => handleChange("eligibiliteFibre", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="fibre-oui" />
                      <Label htmlFor="fibre-oui" className="cursor-pointer">Oui</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="fibre-non" />
                      <Label htmlFor="fibre-non" className="cursor-pointer">Non</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ne_sais_pas" id="fibre-nsp" />
                      <Label htmlFor="fibre-nsp" className="cursor-pointer">Je ne sais pas</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Habitudes */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-6 border border-border space-y-5"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Habitudes
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Temps passé à domicile
                  </Label>
                  <Select value={formData.tempsDomicile} onValueChange={(v) => handleChange("tempsDomicile", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                    <SelectContent>
                      {TEMPS_DOMICILE.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    Équipements énergivores
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPEMENTS.map((equip) => (
                      <label
                        key={equip.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.equipementsEnergivores.includes(equip.value)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.equipementsEnergivores.includes(equip.value)}
                          onCheckedChange={() => handleEquipementToggle(equip.value)}
                        />
                        <span className="text-sm">{equip.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    Recharge véhicule électrique ?
                  </Label>
                  <RadioGroup
                    value={formData.rechargeVehicule}
                    onValueChange={(v) => handleChange("rechargeVehicule", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="vehicule-oui" />
                      <Label htmlFor="vehicule-oui" className="cursor-pointer">Oui</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="vehicule-non" />
                      <Label htmlFor="vehicule-non" className="cursor-pointer">Non</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button type="button" variant="hero" onClick={nextStep}>
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Je valide mes informations
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
