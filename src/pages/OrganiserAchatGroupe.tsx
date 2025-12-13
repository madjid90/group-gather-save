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
  MessageSquare,
  Zap,
  ArrowLeft,
  ArrowRight
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
        {/* Header - matching Navbar style */}
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

        {/* Spacer for fixed header */}
        <div className="h-16" />

        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-subtle" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">Collectivités & Partenaires</span>
              </motion.div>

              <h1 className="text-[26px] leading-tight sm:text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6">
                Organiser un{" "}
                <span className="gradient-text">achat groupé d'énergie</span>{" "}
                dans votre ville
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Switchly accompagne les collectivités et partenaires locaux
                dans la mise en place de campagnes d'achats groupés
                d'électricité et d'internet pour les habitants.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pourquoi un achat groupé local */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 text-center">
                Pourquoi un achat groupé local ?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 text-center max-w-2xl mx-auto">
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
                    className="flex items-center gap-4 bg-background rounded-2xl p-5 border border-border shadow-switchly-sm card-hover"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-foreground font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comment ça fonctionne */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-subtle" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-10 md:mb-12 text-center">
                Comment ça fonctionne avec Switchly
              </h2>
              <div className="space-y-4 md:space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 md:gap-6 bg-card rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-switchly-md border border-border card-hover"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0 shadow-glow">
                      <span className="text-primary-foreground font-bold text-lg md:text-xl">{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <step.icon className="w-5 h-5 text-primary flex-shrink-0 hidden sm:block" />
                      <span className="text-foreground font-medium text-sm md:text-base">{step.text}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* À qui s'adresse ce dispositif */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-10 md:mb-12">
                À qui s'adresse ce dispositif ?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                {targets.map((target, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-3 p-4 md:p-5 bg-background rounded-2xl border border-border shadow-switchly-sm card-hover"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                      <target.icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
                    </div>
                    <span className="text-sm md:text-base font-medium text-foreground">{target.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - matching CTASection style */}
        <section className="py-10 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-hero p-6 sm:p-10 md:p-14 lg:p-20 text-center"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
                <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
              </div>

              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3 md:mb-8">
                  Prêt à lancer un achat groupé ?
                </h2>
                <p className="text-sm sm:text-base md:text-xl text-primary-foreground/80 mb-6 md:mb-10 max-w-2xl mx-auto">
                  Contactez-nous pour étudier la mise en place d'une campagne pour votre territoire.
                </p>
                <Button
                  variant="secondary"
                  size="xl"
                  className="group py-6 px-8 text-base md:text-lg"
                  asChild
                >
                  <Link to="/demande-partenaire">
                    Demander l'organisation d'un achat groupé
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

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

export default OrganiserAchatGroupe;
