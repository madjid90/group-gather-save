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
import { CheckCircle2, Loader2 } from "lucide-react";
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
          <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link to="/" className="text-xl font-bold text-primary">
                Switchly
              </Link>
              <Button asChild variant="ghost" size="sm">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Merci pour votre demande
              </h1>
              <p className="text-muted-foreground mb-8">
                Notre équipe vous contactera rapidement.
              </p>
              <Button asChild variant="outline">
                <Link to="/">Retour à l'accueil</Link>
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
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              Switchly
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link to="/organiser-achat-groupe">Retour</Link>
            </Button>
          </div>
        </header>

        <main className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 text-center">
                Demande d'organisation d'un achat groupé
              </h1>
              <p className="text-muted-foreground text-center mb-10">
                Merci de compléter ce formulaire.
                Notre équipe vous contactera afin d'étudier la mise en place
                d'un achat groupé pour votre territoire.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="organisation">Nom de la collectivité / organisation *</Label>
                  <Input
                    id="organisation"
                    value={formData.organisation}
                    onChange={(e) => handleChange("organisation", e.target.value)}
                    placeholder="Ex : Mairie de Lyon"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type d'organisation *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="territoire">Ville ou territoire concerné *</Label>
                  <Input
                    id="territoire"
                    value={formData.territoire}
                    onChange={(e) => handleChange("territoire", e.target.value)}
                    placeholder="Ex : Lyon et métropole"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Nom du contact *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                    placeholder="Prénom et nom"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contact@mairie.fr"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Numéro de téléphone *</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    placeholder="01 23 45 67 89"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Précisions sur votre projet..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="xl" 
                  className="w-full py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer ma demande"
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </main>

        <footer className="border-t border-border/40 py-8">
          <div className="container mx-auto px-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Retour à l'accueil
            </Link>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default DemandePartenaire;
