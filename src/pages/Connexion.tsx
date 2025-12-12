import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Loader2, Phone, Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PageTransition } from "@/components/PageTransition";

const connexionSchema = z.object({
  telephone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide (ex: 0612345678)"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export default function Connexion() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
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

    const result = connexionSchema.safeParse(formData);
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
      // Convert phone to email format for Supabase auth
      const email = `${formData.telephone.replace(/[^0-9]/g, "")}@switchly.temp`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Numéro de téléphone ou mot de passe incorrect");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Veuillez confirmer votre compte avant de vous connecter");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Connexion réussie !");
      navigate("/dashboard-client");
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="h-screen overflow-hidden flex items-center justify-center px-4 bg-gradient-subtle relative">
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
              Me connecter
            </h1>
            <p className="text-sm text-muted-foreground">
              Accédez à votre espace membre
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
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
                className={`text-sm ${errors.telephone ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              />
              {errors.telephone && (
                <p className="text-xs text-destructive">{errors.telephone}</p>
              )}
            </div>

            <div className="space-y-1.5">
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
                  placeholder="Votre mot de passe"
                  className={`text-sm pr-12 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
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
              size="lg"
              className="w-full py-3 text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Me connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/inscription" className="text-primary hover:underline font-medium">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
