import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Contact</span>
          </div>
          <h1 className="text-[28px] sm:text-[30px] md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Contactez notre équipe
          </h1>
          <p className="text-[16px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto">
            Une question ? Un conseil ? Notre équipe est là pour vous aider.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-switchly">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-[18px] font-semibold text-foreground mb-1">Email</h3>
              <p className="text-[16px] text-muted-foreground">contact@switchly.fr</p>
              <p className="text-[14px] text-muted-foreground/80 mt-1">
                Réponse sous 24h.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-switchly">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-[18px] font-semibold text-foreground mb-1">Téléphone</h3>
              <p className="text-[16px] text-muted-foreground">01 23 45 67 89</p>
              <p className="text-[14px] text-muted-foreground/80 mt-1">
                Lun–Ven, 9h–18h
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-switchly">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-[18px] font-semibold text-foreground mb-1">Adresse</h3>
              <p className="text-[16px] text-muted-foreground">
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
            <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-switchly-lg">
              {isSubmitted ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ nom: "", email: "", sujet: "", message: "" });
                    }}
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-[15px]">Nom complet</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className={`h-[50px] text-[16px] ${errors.nom ? "border-destructive" : ""}`}
                      />
                      {errors.nom && (
                        <p className="text-xs text-destructive">{errors.nom}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[15px]">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean.dupont@email.com"
                        className={`h-[50px] text-[16px] ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sujet" className="text-[15px]">Sujet</Label>
                    <Input
                      id="sujet"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      placeholder="Question sur l'achat groupé"
                      className={`h-[50px] text-[16px] ${errors.sujet ? "border-destructive" : ""}`}
                    />
                    {errors.sujet && (
                      <p className="text-xs text-destructive">{errors.sujet}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[15px]">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre question ou suggestion..."
                      rows={5}
                      className={`min-h-[130px] text-[16px] ${errors.message ? "border-destructive" : ""}`}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full h-[54px] text-[17px] font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer ma demande
                        <Send className="w-4 h-4 ml-2" />
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
