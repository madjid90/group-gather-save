import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Check, 
  ArrowRight, 
  Loader2, 
  Phone, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  UserPlus,
  Users,
  MessageSquare,
  CheckCircle,
  TrendingDown,
  Scale,
  Shield,
  HelpCircle,
  Wifi,
  Gift,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PageTransition } from "@/components/PageTransition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const inscriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  telephone: z.string().regex(/^(\+33|0)[1-9]\d{8}$/, "Numéro de téléphone invalide (ex: 0612345678)"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Inscrivez-vous en 30 sec",
    description: "Téléphone + infos logement. Gratuit.",
  },
  {
    icon: Users,
    number: "2",
    title: "On négocie pour vous",
    description: "Pouvoir collectif = meilleurs prix.",
  },
  {
    icon: MessageSquare,
    number: "3",
    title: "Offre reçue par SMS",
    description: "Offre personnalisée, décision libre.",
  },
  {
    icon: CheckCircle,
    number: "4",
    title: "On gère les démarches",
    description: "Démarches faites pour vous.",
  },
];

const advantages = [
  {
    icon: MessageSquare,
    title: "100% digital",
    description: "Par SMS, zéro appel.",
    color: "primary",
  },
  {
    icon: TrendingDown,
    title: "312€/an économisés",
    description: "Économie moyenne constatée.",
    color: "secondary",
  },
  {
    icon: Shield,
    title: "Fournisseurs reconnus",
    description: "EDF, Engie, TotalEnergies...",
    color: "primary",
  },
  {
    icon: Scale,
    title: "0€ si vous refusez",
    description: "Libre de refuser, 0€ à payer.",
    color: "secondary",
  },
];

const faqItems = [
  {
    question: "L'inscription est-elle vraiment gratuite ?",
    answer: "Oui, 100% gratuite et sans engagement. Vous recevez une offre par SMS et décidez librement.",
  },
  {
    question: "Combien puis-je économiser ?",
    answer: "Nos membres économisent en moyenne 312€/an sur leurs factures d'énergie et d'internet.",
  },
  {
    question: "Comment fonctionne la démarche ?",
    answer: "Tout par SMS et en ligne. Aucun démarchage téléphonique, aucun commercial ne vous appellera.",
  },
  {
    question: "Que se passe-t-il si je refuse l'offre ?",
    answer: "Rien ! Vous êtes libre de refuser sans conséquence. Vous gardez votre contrat actuel.",
  },
];

export default function Invitation() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <PageTransition className="min-h-screen bg-gradient-subtle">
      {/* Hero Section with Referral Message */}
      <section className="relative py-10 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="container mx-auto px-5 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            {/* Referral badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Invitation spéciale</span>
            </motion.div>

            {/* Main message */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-4">
              Un ami vous invite à rejoindre{" "}
              <span className="gradient-text">l'achat groupé</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              "Je viens de m'inscrire à un achat groupé d'électricité et de box internet. Rejoins-moi pour économiser jusqu'à 400€/an !"
            </p>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Électricité</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Internet</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                <Gift className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">100% gratuit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="inscription" className="py-12 sm:py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wide mb-3">
              Inscription gratuite
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Je m'inscris en 30 secondes
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
              Gratuit, sans engagement. Recevez votre offre personnalisée par SMS.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-background rounded-2xl p-6 md:p-8 shadow-switchly-xl border border-border">
              <div className="text-center mb-6">
                <Link to="/" className="inline-flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">Switchly</span>
                </Link>
              </div>

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
                    className={`h-12 text-base ${errors.nom ? "border-destructive" : ""}`}
                  />
                  {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
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
                    className={`h-12 text-base ${errors.telephone ? "border-destructive" : ""}`}
                  />
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
                      placeholder="6 caractères minimum"
                      className={`h-12 text-base pr-12 ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-12 text-base mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      Rejoindre l'achat groupé
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                ✓ Gratuit • ✓ Sans engagement • ✓ 100% digital
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-14"
          >
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wide mb-3">
              Comment ça marche
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              4 étapes simples
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Un processus simple et transparent pour économiser sans effort.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-card rounded-xl lg:rounded-2xl p-5 lg:p-6 h-full border border-border card-hover text-center">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-hero text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2 mx-auto">
                    <step.icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                  </div>
                  <h3 className="text-sm lg:text-base font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-14"
          >
            <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wide mb-3">
              Nos avantages
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Pourquoi rejoindre Switchly ?
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-background rounded-xl lg:rounded-2xl p-5 lg:p-6 h-full border border-border card-hover text-center">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                      advantage.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                    }`}
                  >
                    <advantage.icon
                      className={`w-6 h-6 lg:w-7 lg:h-7 ${
                        advantage.color === "primary" ? "text-primary" : "text-secondary"
                      }`}
                    />
                  </div>
                  <h3 className="text-sm lg:text-base font-semibold text-foreground mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {advantage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-switchly-lg">
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/50 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4 text-foreground">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-card">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                Prêt à économiser avec votre ami ?
              </h2>
              <p className="text-base lg:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Rejoignez l'achat groupé et économisez ensemble sur vos factures d'électricité et d'internet.
              </p>
              <Button
                variant="secondary"
                size="xl"
                className="py-6 px-10 text-lg"
                onClick={() => document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Je m'inscris gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-primary-foreground/70 mt-6">
                ✓ Inscription gratuite • ✓ Sans engagement • ✓ Offre personnalisée
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
