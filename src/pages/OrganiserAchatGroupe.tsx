import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Building2, 
  Users, 
  Landmark, 
  Heart, 
  Briefcase,
  Phone,
  FileText,
  Send,
  UserCheck,
  MessageSquare
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const OrganiserAchatGroupe = () => {
  const benefits = [
    "Réduction potentielle des factures",
    "Aucune obligation de souscription",
    "Démarche transparente et encadrée"
  ];

  const steps = [
    { icon: Phone, text: "Vous nous contactez pour votre ville ou territoire" },
    { icon: FileText, text: "Switchly crée et pilote une campagne dédiée" },
    { icon: Send, text: "Vous diffusez un lien d'inscription aux habitants" },
    { icon: MessageSquare, text: "Switchly négocie avec les fournisseurs" },
    { icon: UserCheck, text: "Les habitants reçoivent une offre personnalisée" }
  ];

  const targets = [
    { icon: Landmark, text: "Mairies" },
    { icon: Building2, text: "Communautés de communes" },
    { icon: Users, text: "Régions" },
    { icon: Heart, text: "Associations locales" },
    { icon: Briefcase, text: "Partenaires institutionnels" }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
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

        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6">
                Organiser un achat groupé d'énergie dans votre ville
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Switchly accompagne les collectivités et partenaires locaux
                dans la mise en place de campagnes d'achats groupés
                d'électricité et d'internet pour les habitants.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pourquoi un achat groupé local */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                Pourquoi un achat groupé local ?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8 text-center">
                Les achats groupés permettent de négocier des tarifs plus avantageux
                grâce au regroupement des foyers volontaires,
                tout en laissant aux habitants la liberté d'accepter ou de refuser l'offre.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 bg-muted/30 rounded-lg p-4"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comment ça fonctionne */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
                Comment ça fonctionne avec Switchly
              </h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 bg-background rounded-xl p-5 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <step.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{step.text}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* À qui s'adresse ce dispositif */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-10">
                À qui s'adresse ce dispositif ?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {targets.map((target, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-3 p-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <target.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{target.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <Button asChild size="xl" className="py-6 px-8">
                <Link to="/demande-partenaire">
                  Demander l'organisation d'un achat groupé
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer simple */}
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

export default OrganiserAchatGroupe;
