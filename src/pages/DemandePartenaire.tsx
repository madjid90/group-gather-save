import { useState, useEffect } from "react";
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
import { CheckCircle2, Loader2, ArrowLeft, Building2, ArrowRight } from "lucide-react";
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <PageTransition className="min-h-screen py-6 md:py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <div className="max-w-md mx-auto text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-2">
                Merci pour votre demande
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe vous contactera rapidement.
              </p>
              <Button asChild variant="outline" size="lg" className="py-3 text-sm">
                <Link to="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen py-6 md:py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link 
          to="/organiser-achat-groupe" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-3">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Demande partenaire</span>
          </div>
          <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-1">
            Demande d'organisation d'un achat groupé
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Notre équipe vous contactera afin d'étudier la mise en place
            d'un achat groupé pour votre territoire.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-switchly-lg">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="organisation" className="text-sm font-medium text-foreground">
                    Collectivité / Organisation *
                  </Label>
                  <Input
                    id="organisation"
                    value={formData.organisation}
                    onChange={(e) => handleChange("organisation", e.target.value)}
                    placeholder="Ex : Mairie de Lyon"
                    className="text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-sm font-medium text-foreground">
                    Type d'organisation *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mairie">Mairie</SelectItem>
                      <SelectItem value="collectivite">Collectivité</SelectItem>
                      <SelectItem value="association">Association</SelectItem>
                      <SelectItem value="partenaire">Partenaire privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="territoire" className="text-sm font-medium text-foreground">
                  Ville ou territoire concerné *
                </Label>
                <Input
                  id="territoire"
                  value={formData.territoire}
                  onChange={(e) => handleChange("territoire", e.target.value)}
                  placeholder="Ex : Lyon et métropole"
                  className="text-sm"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contact" className="text-sm font-medium text-foreground">
                    Nom du contact *
                  </Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                    placeholder="Prénom et nom"
                    className="text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telephone" className="text-sm font-medium text-foreground">
                    Téléphone *
                  </Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    placeholder="01 23 45 67 89"
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Adresse email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contact@mairie.fr"
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message (optionnel)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Précisions sur votre projet..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <Button 
                type="submit" 
                variant="hero"
                size="lg" 
                className="w-full py-3 text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default DemandePartenaire;
