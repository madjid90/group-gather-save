import { useState } from "react";
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
  CreditCard,
  Smile,
  Cable,
  Car,
  Settings,
  BrickWall,
  Loader2,
  Save,
} from "lucide-react";

interface FormData {
  // Section 1: Profil du logement
  typeLogement: string;
  surface: string;
  nombreOccupants: string;
  isolation: string;
  modeChauffage: string;
  chauffeEauElectrique: string;
  // Section 2: Contrat d'électricité
  fournisseurEnergie: string;
  optionTarifaire: string;
  puissanceCompteur: string;
  montantFacture: string;
  // Section 3: Internet
  typeConnexion: string;
  fournisseurInternet: string;
  prixMensuelInternet: string;
  satisfaction: number;
  eligibiliteFibre: string;
  // Section 4: Habitudes & équipements
  tempsDomicile: string;
  equipementsEnergivores: string[];
  rechargeVehicule: string;
}

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
  { value: "18", label: "18 kVA" },
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

export default function HousingInfoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    typeLogement: "",
    surface: "",
    nombreOccupants: "",
    isolation: "",
    modeChauffage: "",
    chauffeEauElectrique: "",
    fournisseurEnergie: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour enregistrer vos informations.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          fournisseur_energie_actuel: formData.fournisseurEnergie,
          fournisseur_internet_actuel: formData.fournisseurInternet,
          type_connexion_internet: formData.typeConnexion as "fibre" | "adsl" | "4g_box" || null,
          prix_actuel_internet: formData.prixMensuelInternet ? parseFloat(formData.prixMensuelInternet) : null,
          puissance_compteur: formData.puissanceCompteur,
          type_compteur: formData.optionTarifaire === "hphc" ? "linky" : "ancien",
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Erreur lors de l'enregistrement.");
        console.error(error);
        return;
      }

      toast.success("Informations enregistrées avec succès !");
    } catch (error) {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Profil du logement */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 border border-border"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Profil du logement
        </h2>
        
        <div className="grid gap-5 md:grid-cols-2">
          {/* Type de logement */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Home className="w-4 h-4 text-muted-foreground" />
              Type de logement
            </Label>
            <Select value={formData.typeLogement} onValueChange={(v) => handleChange("typeLogement", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_LOGEMENT.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Surface */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              Surface du logement (m²)
            </Label>
            <Input
              type="number"
              value={formData.surface}
              onChange={(e) => handleChange("surface", e.target.value)}
              placeholder="Ex: 75"
            />
          </div>

          {/* Nombre d'occupants */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-muted-foreground" />
              Nombre d'occupants
            </Label>
            <Select value={formData.nombreOccupants} onValueChange={(v) => handleChange("nombreOccupants", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "personne" : "personnes"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Isolation */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <BrickWall className="w-4 h-4 text-muted-foreground" />
              Isolation du logement
            </Label>
            <Select value={formData.isolation} onValueChange={(v) => handleChange("isolation", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {ISOLATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode de chauffage */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Flame className="w-4 h-4 text-muted-foreground" />
              Mode de chauffage
            </Label>
            <Select value={formData.modeChauffage} onValueChange={(v) => handleChange("modeChauffage", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {MODES_CHAUFFAGE.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chauffe-eau électrique */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="w-4 h-4 text-muted-foreground" />
              <Zap className="w-3 h-3 text-muted-foreground -ml-1" />
              Chauffe-eau électrique
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
      </motion.section>

      {/* Section 2: Contrat d'électricité */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-6 border border-border"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Contrat d'électricité
        </h2>
        
        <div className="grid gap-5 md:grid-cols-2">
          {/* Fournisseur actuel */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4 text-muted-foreground" />
              Fournisseur actuel
            </Label>
            <Select value={formData.fournisseurEnergie} onValueChange={(v) => handleChange("fournisseurEnergie", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {FOURNISSEURS_ENERGIE.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Option tarifaire */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Option tarifaire
            </Label>
            <Select value={formData.optionTarifaire} onValueChange={(v) => handleChange("optionTarifaire", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS_TARIFAIRES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Puissance compteur */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              Puissance compteur
            </Label>
            <Select value={formData.puissanceCompteur} onValueChange={(v) => handleChange("puissanceCompteur", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {PUISSANCES_COMPTEUR.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Montant facture */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
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

        {/* Upload facture */}
        <div className="mt-5 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <FileUp className="w-4 h-4 text-muted-foreground" />
            Télécharger une facture (optionnel)
          </Label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Glissez votre facture ici ou cliquez pour parcourir
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG (max 5 Mo)</p>
          </div>
        </div>
      </motion.section>

      {/* Section 3: Internet */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-6 border border-border"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Internet
        </h2>
        
        <div className="grid gap-5 md:grid-cols-2">
          {/* Type de connexion */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Type de connexion
            </Label>
            <Select value={formData.typeConnexion} onValueChange={(v) => handleChange("typeConnexion", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_CONNEXION.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fournisseur Internet */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Radio className="w-4 h-4 text-muted-foreground" />
              Fournisseur Internet
            </Label>
            <Select value={formData.fournisseurInternet} onValueChange={(v) => handleChange("fournisseurInternet", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {FOURNISSEURS_INTERNET.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix mensuel */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Prix mensuel (€)
            </Label>
            <Input
              type="number"
              value={formData.prixMensuelInternet}
              onChange={(e) => handleChange("prixMensuelInternet", e.target.value)}
              placeholder="Ex: 35"
            />
          </div>

          {/* Éligibilité fibre */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Cable className="w-4 h-4 text-muted-foreground" />
              <Zap className="w-3 h-3 text-muted-foreground -ml-1" />
              Éligibilité fibre
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

        {/* Satisfaction */}
        <div className="mt-5 space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Smile className="w-4 h-4 text-muted-foreground" />
            Satisfaction actuelle
          </Label>
          <div className="space-y-2">
            <Slider
              value={[formData.satisfaction]}
              onValueChange={([v]) => handleChange("satisfaction", v)}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Très insatisfait</span>
              <span>Neutre</span>
              <span>Très satisfait</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 4: Habitudes & équipements */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl p-6 border border-border"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Habitudes & équipements
        </h2>
        
        <div className="grid gap-5 md:grid-cols-2">
          {/* Temps à domicile */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Temps à domicile
            </Label>
            <Select value={formData.tempsDomicile} onValueChange={(v) => handleChange("tempsDomicile", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {TEMPS_DOMICILE.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recharge véhicule électrique */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Car className="w-4 h-4 text-muted-foreground" />
              <Zap className="w-3 h-3 text-muted-foreground -ml-1" />
              Recharge véhicule électrique
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

        {/* Équipements énergivores */}
        <div className="mt-5 space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Équipements énergivores
          </Label>
          <div className="flex flex-wrap gap-2">
            {EQUIPEMENTS.map((equip) => (
              <button
                key={equip.value}
                type="button"
                onClick={() => handleEquipementToggle(equip.value)}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${
                  formData.equipementsEnergivores.includes(equip.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                {equip.label}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Submit Button */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full md:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer mes informations
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
