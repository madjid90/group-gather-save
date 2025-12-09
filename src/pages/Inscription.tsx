import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Check, ArrowRight, Loader2, Phone, User, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const inscriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  telephone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide (ex: 0612345678)"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function Inscription() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
      // Create email from phone number for Supabase auth
      const cleanPhone = formData.telephone.replace(/[^0-9]/g, "");
      const email = `${cleanPhone}@switchly.temp`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard-client`,
          data: {
            prenom: formData.nom.split(" ")[0] || formData.nom,
            nom: formData.nom,
            telephone: formData.telephone,
            code_postal: "",
            ville: "",
            contrats: "les_deux",
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Ce numéro de téléphone est déjà inscrit.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Try to send welcome SMS (will fail gracefully if Twilio not configured)
      if (data.user) {
        try {
          await supabase.functions.invoke("send-welcome-sms", {
            body: { 
              userId: data.user.id,
              telephone: formData.telephone 
            },
          });
        } catch (smsError) {
          // SMS sending is optional, don't block registration
          console.log("SMS not sent (Twilio may not be configured)");
        }
      }

      setIsSuccess(true);
      toast.success("Inscription réussie !");
      // Redirect to dashboard after a short delay
      setTimeout(() => navigate("/dashboard-client"), 2000);
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-screen flex items-center justify-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-3xl p-8 md:p-10 shadow-switchly-xl border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-foreground mb-3">
            Bienvenue sur Switchly !
          </h1>
          <p className="text-base sm:text-[17px] text-muted-foreground mb-8">
            Votre inscription est confirmée. Complétez votre profil logement pour recevoir une offre personnalisée.
          </p>
          <Button 
            variant="hero" 
            className="w-full h-[52px] sm:h-[56px] text-base sm:text-lg font-semibold rounded-xl"
            asChild
          >
            <Link to="/dashboard-client">Accéder à mon espace</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-switchly-xl border border-border"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Switchly</span>
            </Link>
            <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-foreground mb-2 leading-tight">
              Créer mon compte Switchly
            </h1>
            <p className="text-base sm:text-[17px] text-muted-foreground">
              Inscription gratuite en 10 secondes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2 text-[15px] sm:text-base font-medium">
                <User className="w-4 h-4 text-muted-foreground" />
                Nom complet
              </Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className={`h-[48px] sm:h-[52px] text-base rounded-xl ${errors.nom ? "border-destructive" : ""}`}
              />
              {errors.nom && (
                <p className="text-xs text-destructive">{errors.nom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2 text-[15px] sm:text-base font-medium">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Numéro de téléphone
              </Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="0612345678"
                className={`h-[48px] sm:h-[52px] text-base rounded-xl ${errors.telephone ? "border-destructive" : ""}`}
              />
              {errors.telephone && (
                <p className="text-xs text-destructive">{errors.telephone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-[15px] sm:text-base font-medium">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`h-[48px] sm:h-[52px] text-base rounded-xl pr-12 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="hero"
                className="w-full h-[52px] sm:h-[56px] text-base sm:text-lg font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    M'inscrire gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-[15px] sm:text-base text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link to="/connexion" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-secondary" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-1.5">
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
