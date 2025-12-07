import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Wifi, Check, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const inscriptionSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide"),
  codePostal: z.string().regex(/^\d{5}$/, "Code postal invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  contrats: z.enum(["electricite", "internet", "les_deux"]),
});

export default function Inscription() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    codePostal: "",
    password: "",
    contrats: "les_deux" as "electricite" | "internet" | "les_deux",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
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
      // Get city from postal code (simplified - in reality you'd use an API)
      const ville = formData.codePostal.startsWith("75") ? "Paris" : 
                    formData.codePostal.startsWith("69") ? "Lyon" :
                    formData.codePostal.startsWith("13") ? "Marseille" :
                    formData.codePostal.startsWith("44") ? "Nantes" :
                    formData.codePostal.startsWith("33") ? "Bordeaux" : "Autre";

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            prenom: formData.prenom,
            nom: formData.nom,
            telephone: formData.telephone,
            code_postal: formData.codePostal,
            ville: ville,
            contrats: formData.contrats,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
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
              Rejoignez le groupement de votre ville en 20 secondes
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean.dupont@email.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className={errors.telephone ? "border-destructive" : ""}
                />
                {errors.telephone && (
                  <p className="text-xs text-destructive">{errors.telephone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="codePostal">Code postal</Label>
                <Input
                  id="codePostal"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  placeholder="75001"
                  className={errors.codePostal ? "border-destructive" : ""}
                />
                {errors.codePostal && (
                  <p className="text-xs text-destructive">{errors.codePostal}</p>
                )}
              </div>
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
