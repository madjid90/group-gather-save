import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Check, ArrowRight, Loader2, Phone, User, Lock, Eye, EyeOff, ArrowLeft, MessageCircle, Mail, Copy, Users, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PageTransition } from "@/components/PageTransition";
import { DynamicSEOHead } from "@/components/seo/DynamicSEOHead";

const inscriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  telephone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide (ex: 0612345678)"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { score: 1, label: "Faible", color: "bg-destructive" };
  if (score <= 2) return { score: 2, label: "Moyen", color: "bg-yellow-500" };
  if (score <= 3) return { score: 3, label: "Bon", color: "bg-secondary" };
  return { score: 4, label: "Excellent", color: "bg-secondary" };
}

interface CalculatorProfile {
  logement: string;
  surface: string;
  chauffage: string;
  facture: string;
  estimation?: {
    minEconomie: number;
    maxEconomie: number;
  };
}

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveCount, setLiveCount] = useState(2547);
  const [calculatorProfile, setCalculatorProfile] = useState<CalculatorProfile | null>(null);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/inscription` : "";
  const shareText = "J'ai comparé mes offres énergie et internet sur Switchly et j'économise jusqu'à 400€/an ! C'est gratuit :";

  // Load calculator profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('switchly_calculator_profile');
    if (saved) {
      try {
        setCalculatorProfile(JSON.parse(saved));
      } catch {
        console.log('Could not parse calculator profile');
      }
    }
  }, []);

  // Simulate live counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveCount(prev => prev + 1);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Real-time validation
  const validationState = useMemo(() => {
    const result: Record<string, { valid: boolean; message?: string }> = {};
    
    if (touched.nom) {
      const nomValid = formData.nom.length >= 2;
      result.nom = { valid: nomValid, message: nomValid ? undefined : "Min. 2 caractères" };
    }
    
    if (touched.telephone) {
      const phoneValid = /^(\+33|0)[1-9]\d{8}$/.test(formData.telephone);
      result.telephone = { valid: phoneValid, message: phoneValid ? undefined : "Format: 0612345678" };
    }
    
    if (touched.password) {
      const passValid = formData.password.length >= 6;
      result.password = { valid: passValid, message: passValid ? undefined : "Min. 6 caractères" };
    }
    
    return result;
  }, [formData, touched]);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, "_blank");
  };

  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.location.href = url;
  };

  const handleEmailShare = () => {
    const subject = "Rejoins l'achat groupé Switchly !";
    const body = `${shareText}\n\n${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
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

      if (data.user) {
        try {
          await supabase.functions.invoke("send-welcome-sms", {
            body: { 
              userId: data.user.id,
              telephone: formData.telephone 
            },
          });
        } catch (smsError) {
          console.log("SMS not sent (Twilio may not be configured)");
        }
      }

      navigate("/partage-invitation");
      toast.success("Inscription réussie !");
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center px-5 sm:px-6 py-10 sm:py-12 bg-gradient-subtle">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card rounded-2xl p-6 md:p-8 shadow-switchly-xl border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Bienvenue sur Switchly !
          </h1>
          <p className="text-base text-muted-foreground mb-8">
            Votre inscription est confirmée. Complétez votre profil pour recevoir une offre personnalisée adaptée à votre consommation.
          </p>
          <Button variant="hero" size="lg" className="w-full py-5 text-base mb-6" asChild>
            <Link to="/dashboard-client">Accéder à mon espace</Link>
          </Button>
          <div className="border-t border-border pt-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Invitez vos proches !</h2>
            <p className="text-xs text-muted-foreground mb-4">Plus on est nombreux, plus on économise.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="gap-1.5">
                <MessageCircle className="w-4 h-4 text-green-500" />WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={handleSMSShare} className="gap-1.5">
                <MessageCircle className="w-4 h-4" />SMS
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailShare} className="gap-1.5">
                <Mail className="w-4 h-4" />Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
                {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copié !" : "Copier"}
              </Button>
            </div>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-5 sm:px-6 py-10 sm:py-12 bg-gradient-subtle relative">
      <DynamicSEOHead 
        defaultTitle="Inscription - Switchly | Rejoignez l'achat groupé"
        defaultDescription="Inscrivez-vous gratuitement à Switchly pour économiser sur vos factures d'énergie et internet grâce à l'achat groupé."
      />
      {/* Fixed Back Button */}
      <Link
        to="/" 
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Retour</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Live counter badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="text-sm font-medium text-foreground">
              <span className="font-bold">{liveCount.toLocaleString()}</span> inscrits
            </span>
            <Users className="w-4 h-4 text-secondary" />
          </div>
        </motion.div>

        {/* Calculator Profile Recap */}
        {calculatorProfile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <p className="text-xs text-muted-foreground mb-2">Votre profil :</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground">
                {calculatorProfile.logement}
              </span>
              <span className="px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground">
                {calculatorProfile.surface}
              </span>
              <span className="px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground">
                {calculatorProfile.chauffage}
              </span>
              <span className="px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground">
                {calculatorProfile.facture}
              </span>
            </div>
            {calculatorProfile.estimation && (
              <p className="text-xs text-primary mt-2 font-medium">
                Économies estimées : {calculatorProfile.estimation.minEconomie}€ - {calculatorProfile.estimation.maxEconomie}€ / an
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl p-6 md:p-8 shadow-switchly-xl border border-border"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Switchly</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Rejoindre l'achat groupé
            </h1>
            <p className="text-base text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Inscription gratuite en 30 secondes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4 text-primary" />
                Nom complet
              </Label>
              <div className="relative">
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Jean Dupont"
                  className={`h-12 text-base pr-10 ${
                    errors.nom ? "border-destructive focus-visible:ring-destructive/30" : 
                    validationState.nom?.valid ? "border-secondary focus-visible:ring-secondary/30" : ""
                  }`}
                />
                <AnimatePresence>
                  {validationState.nom?.valid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check className="w-5 h-5 text-secondary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Phone className="w-4 h-4 text-primary" />
                Téléphone
              </Label>
              <div className="relative">
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0612345678"
                  className={`h-12 text-base pr-10 ${
                    errors.telephone ? "border-destructive focus-visible:ring-destructive/30" : 
                    validationState.telephone?.valid ? "border-secondary focus-visible:ring-secondary/30" : ""
                  }`}
                />
                <AnimatePresence>
                  {validationState.telephone?.valid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check className="w-5 h-5 text-secondary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {errors.telephone && <p className="text-sm text-destructive">{errors.telephone}</p>}
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
                  onBlur={handleBlur}
                  placeholder="6 caractères minimum"
                  className={`h-12 text-base pr-12 ${
                    errors.password ? "border-destructive focus-visible:ring-destructive/30" : 
                    validationState.password?.valid ? "border-secondary focus-visible:ring-secondary/30" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {formData.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.score >= 3 ? "text-secondary" : "text-muted-foreground"}`}>
                    Force : {passwordStrength.label}
                  </p>
                </motion.div>
              )}
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-14 text-base mt-4 group"
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
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-base text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link to="/connexion" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-secondary" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-secondary" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-secondary" />
                <span>100% gratuit</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social proof mini testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-muted-foreground italic">
            "J'ai économisé 280€ sur ma facture d'électricité !" — Marie, Lyon
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
