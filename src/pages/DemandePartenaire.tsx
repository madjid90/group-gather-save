import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { CheckCircle2, Loader2, Zap, ArrowLeft, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DemandePartenaire = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organisation: "",
    type: "",
    territoire: "",
    contact: "",
    email: "",
    telephone: "",
    message: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organisation || !formData.type || !formData.territoire || 
        !formData.contact || !formData.email || !formData.telephone) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.contact,
          email: formData.email,
          phone: formData.telephone,
          subject: `Demande partenaire - ${formData.organisation} (${formData.type})`,
          message: `
Organisation : ${formData.organisation}
Type : ${formData.type}
Territoire : ${formData.territoire}
Contact : ${formData.contact}
Email : ${formData.email}
Téléphone : ${formData.telephone}

Message :
${formData.message || "Aucun message additionnel"}
          `.trim(),
          isPartnerRequest: true
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 glass">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 group" aria-label="Switchly - Retour à l'accueil">
                <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">Switchly</span>
              </Link>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à l'accueil
                </Link>
              </Button>
            </nav>
          </header>

          <div className="h-16" />

          <main className="flex-1 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-6 shadow-glow">
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Merci pour votre demande
              </h1>
              <p className="text-muted-foreground mb-8 text-base md:text-lg">
                Notre équipe vous contactera rapidement.
              </p>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à l'accueil
                </Link>
              </Button>
            </motion.div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group" aria-label="Switchly - Retour à l'accueil">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">Switchly</span>
            </Link>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/organiser-achat-groupe">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </Button>
          </nav>
        </header>

        <div className="h-16" />

        {/* Hero section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-subtle" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-10 right-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">Demande partenaire</span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Demande d'organisation d'un{" "}
                <span className="gradient-text">achat groupé</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Merci de compléter ce formulaire.
                Notre équipe vous contactera afin d'étudier la mise en place
                d'un achat groupé pour votre territoire.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form section */}
        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-switchly-lg border border-border">
                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="organisation" className="text-sm font-medium">
                      Nom de la collectivité / organisation *
                    </Label>
                    <Input
                      id="organisation"
                      value={formData.organisation}
                      onChange={(e) => handleChange("organisation", e.target.value)}
                      placeholder="Ex : Mairie de Lyon"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Type d'organisation *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mairie">Mairie</SelectItem>
                        <SelectItem value="collectivite">Collectivité</SelectItem>
                        <SelectItem value="association">Association</SelectItem>
                        <SelectItem value="partenaire">Partenaire privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="territoire" className="text-sm font-medium">
                      Ville ou territoire concerné *
                    </Label>
                    <Input
                      id="territoire"
                      value={formData.territoire}
                      onChange={(e) => handleChange("territoire", e.target.value)}
                      placeholder="Ex : Lyon et métropole"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-sm font-medium">
                      Nom du contact *
                    </Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => handleChange("contact", e.target.value)}
                      placeholder="Prénom et nom"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Adresse email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="contact@mairie.fr"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-sm font-medium">
                      Numéro de téléphone *
                    </Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => handleChange("telephone", e.target.value)}
                      placeholder="01 23 45 67 89"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message (optionnel)
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Précisions sur votre projet..."
                      rows={4}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero"
                    size="xl" 
                    className="w-full py-6 text-base md:text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer ma demande"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer simple */}
        <footer className="border-t border-border py-8 bg-card">
          <div className="container mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default DemandePartenaire;
