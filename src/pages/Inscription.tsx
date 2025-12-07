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
import { Link, useNavigate } from "react-router-dom";
import { Zap, Wifi, Check, ArrowRight, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const VILLES = [
  { value: "paris", label: "Paris", codePostal: "75000" },
  { value: "lyon", label: "Lyon", codePostal: "69000" },
  { value: "marseille", label: "Marseille", codePostal: "13000" },
  { value: "toulouse", label: "Toulouse", codePostal: "31000" },
  { value: "nice", label: "Nice", codePostal: "06000" },
  { value: "nantes", label: "Nantes", codePostal: "44000" },
  { value: "strasbourg", label: "Strasbourg", codePostal: "67000" },
  { value: "montpellier", label: "Montpellier", codePostal: "34000" },
  { value: "bordeaux", label: "Bordeaux", codePostal: "33000" },
  { value: "lille", label: "Lille", codePostal: "59000" },
  { value: "rennes", label: "Rennes", codePostal: "35000" },
  { value: "reims", label: "Reims", codePostal: "51100" },
  { value: "saint-etienne", label: "Saint-Étienne", codePostal: "42000" },
  { value: "toulon", label: "Toulon", codePostal: "83000" },
  { value: "le-havre", label: "Le Havre", codePostal: "76600" },
  { value: "grenoble", label: "Grenoble", codePostal: "38000" },
  { value: "dijon", label: "Dijon", codePostal: "21000" },
  { value: "angers", label: "Angers", codePostal: "49000" },
  { value: "nimes", label: "Nîmes", codePostal: "30000" },
  { value: "clermont-ferrand", label: "Clermont-Ferrand", codePostal: "63000" },
];

const inscriptionSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  telephone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide (ex: 0612345678)"),
  ville: z.string().min(1, "Veuillez sélectionner une ville"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  contrats: z.enum(["electricite", "internet", "les_deux"]),
});

export default function Inscription() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    ville: "",
    password: "",
    contrats: "les_deux" as "electricite" | "internet" | "les_deux",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVilleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ville: value }));
    if (errors.ville) {
      setErrors((prev) => ({ ...prev, ville: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inscriptionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const selectedVille = VILLES.find((v) => v.value === formData.ville);
      const villeLabel = selectedVille?.label || formData.ville;
      const codePostal = selectedVille?.codePostal || "00000";

      // Create email from phone number for Supabase auth
      const email = `${formData.telephone.replace(/[^0-9]/g, "")}@switchly.temp`;

      const { error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            prenom: formData.prenom,
            nom: formData.nom,
            telephone: formData.telephone,
            code_postal: codePostal,
            ville: villeLabel,
            contrats: formData.contrats,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Ce numéro de téléphone est déjà utilisé. Connectez-vous ou utilisez un autre numéro.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate("/connexion");
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl p-8 md:p-10 shadow-switchly-xl border border-border"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Switchly</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Créer mon compte
            </h1>
            <p className="text-muted-foreground">
              Rejoignez Switchly en 20 secondes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className={errors.prenom ? "border-destructive" : ""}
                />
                {errors.prenom && (
                  <p className="text-xs text-destructive">{errors.prenom}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className={errors.nom ? "border-destructive" : ""}
                />
                {errors.nom && (
                  <p className="text-xs text-destructive">{errors.nom}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Numéro de téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="0612345678"
                className={errors.telephone ? "border-destructive" : ""}
              />
              {errors.telephone && (
                <p className="text-xs text-destructive">{errors.telephone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Select value={formData.ville} onValueChange={handleVilleChange}>
                <SelectTrigger 
                  id="ville"
                  className={errors.ville ? "border-destructive" : ""}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Sélectionnez votre ville" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border border-border z-50">
                  {VILLES.map((ville) => (
                    <SelectItem key={ville.value} value={ville.value}>
                      {ville.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ville && (
                <p className="text-xs text-destructive">{errors.ville}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Type de contrat souhaité</Label>
              <RadioGroup
                value={formData.contrats}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contrats: value as "electricite" | "internet" | "les_deux",
                  }))
                }
                className="grid grid-cols-3 gap-3"
              >
                <Label
                  htmlFor="electricite"
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.contrats === "electricite"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value="electricite"
                    id="electricite"
                    className="sr-only"
                  />
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Électricité</span>
                </Label>
                <Label
                  htmlFor="internet"
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.contrats === "internet"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value="internet"
                    id="internet"
                    className="sr-only"
                  />
                  <Wifi className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Internet</span>
                </Label>
                <Label
                  htmlFor="les_deux"
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.contrats === "les_deux"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value="les_deux"
                    id="les_deux"
                    className="sr-only"
                  />
                  <div className="flex">
                    <Zap className="w-5 h-5 text-primary" />
                    <Wifi className="w-5 h-5 text-primary -ml-1" />
                  </div>
                  <span className="text-sm font-medium">Les deux</span>
                </Label>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link to="/connexion" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-secondary" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-secondary" />
                <span>Sans engagement</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
