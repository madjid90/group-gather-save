import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Check, ArrowRight, Loader2, Phone, User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
      <div className="h-screen overflow-hidden flex items-center justify-center px-4 bg-gradient-subtle">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-switchly-xl border border-border text-center"
        >
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-2">
            Bienvenue sur Switchly !
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Votre inscription est confirmée. Complétez votre profil logement pour recevoir une offre personnalisée.
          </p>
          <Button 
            variant="hero" 
            size="lg"
            className="w-full py-3 text-sm"
            asChild
          >
            <Link to="/dashboard-client">Accéder à mon espace</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-4 bg-gradient-subtle relative">
      {/* Fixed Back Button */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Retour</span>
      </Link>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-switchly-xl border border-border"
        >
          {/* Header */}
          <div className="text-center mb-5">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Switchly</span>
            </Link>
            <h1 className="text-[22px] sm:text-2xl font-bold text-foreground mb-1 leading-tight">
              Rejoindre l'achat groupé
            </h1>
            <p className="text-sm text-muted-foreground">
              Inscription gratuite en 10 secondes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4 text-primary" />
                Nom complet
              </Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className={errors.nom ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.nom && (
                <p className="text-xs text-destructive">{errors.nom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Phone className="w-4 h-4 text-primary" />
                Téléphone
              </Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="0612345678"
                className={errors.telephone ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.telephone && (
                <p className="text-xs text-destructive">{errors.telephone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="6 caractères minimum"
                  className={`pr-12 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  M'inscrire gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link to="/connexion" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
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
