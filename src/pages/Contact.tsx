import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  sujet: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
});

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
    toast.success("Message envoyé avec succès !");
  };

  return (
    <div className="min-h-screen py-10 md:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 md:mb-6">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Contact</span>
          </div>
          <h1 className="text-[20px] sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-6">
            Contactez notre équipe
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden md:inline">Une question ? Un conseil ? Notre équipe est là pour vous aider.</span>
            <span className="md:hidden">Notre équipe est là pour vous aider.</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3 md:space-y-6"
          >
            <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 border border-border shadow-switchly card-hover">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-6">
                <Mail className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Email</h3>
              <p className="text-sm md:text-lg text-muted-foreground">contact@switchly.fr</p>
              <p className="text-xs md:text-base text-muted-foreground/80 mt-1">
                Réponse sous 24h.
              </p>
            </div>

            <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 border border-border shadow-switchly card-hover">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-6">
                <Phone className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Téléphone</h3>
              <p className="text-sm md:text-lg text-muted-foreground">01 23 45 67 89</p>
              <p className="text-xs md:text-base text-muted-foreground/80 mt-1">
                Lun–Ven, 9h–18h
              </p>
            </div>

            <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 border border-border shadow-switchly card-hover">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-6">
                <MapPin className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Adresse</h3>
              <p className="text-sm md:text-lg text-muted-foreground">
                123 Avenue de la République
                <br />
                75011 Paris, France
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 border border-border shadow-switchly-lg">
              {isSubmitted ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
                  </div>
                  <h3 className="text-[20px] sm:text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
                    Message envoyé !
                  </h3>
                  <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button
                    variant="outline"
                    size="xl"
                    className="py-7 sm:py-5 text-base sm:text-lg"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ nom: "", email: "", sujet: "", message: "" });
                    }}
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm md:text-base font-medium text-foreground">
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
                        <p className="text-xs md:text-sm text-destructive">{errors.nom}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm md:text-base font-medium text-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean.dupont@email.com"
                        className={errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs md:text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sujet" className="text-sm md:text-base font-medium text-foreground">
                      Sujet
                    </Label>
                    <Input
                      id="sujet"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      placeholder="Question sur l'achat groupé"
                      className={errors.sujet ? "border-destructive focus-visible:ring-destructive/30" : ""}
                    />
                    {errors.sujet && (
                      <p className="text-xs md:text-sm text-destructive">{errors.sujet}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm md:text-base font-medium text-foreground">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre question ou suggestion..."
                      rows={5}
                      className={errors.message ? "border-destructive focus-visible:ring-destructive/30" : ""}
                    />
                    {errors.message && (
                      <p className="text-xs md:text-sm text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full py-7 sm:py-5 text-base sm:text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer ma demande
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
