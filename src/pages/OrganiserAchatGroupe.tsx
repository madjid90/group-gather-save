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
import { MobileFixedCTAPartenaire } from "@/components/landing/MobileFixedCTAPartenaire";

const OrganiserAchatGroupe = () => {
  const benefits = [
    "Réduction potentielle des factures",
    "Aucune obligation de souscription",
    "Démarche transparente et encadrée"
  ];

  const steps = [
    { 
      icon: Phone, 
      number: "1",
      title: "Vous nous contactez",
      titleMobile: "Vous nous contactez",
      description: "Prenez contact pour votre ville ou territoire.",
      descriptionMobile: "Contactez-nous pour votre territoire."
    },
    { 
      icon: FileText, 
      number: "2",
      title: "Switchly crée la campagne",
      titleMobile: "On crée la campagne",
      description: "Nous créons et pilotons une campagne dédiée à votre territoire.",
      descriptionMobile: "Campagne dédiée à votre territoire."
    },
    { 
      icon: Send, 
      number: "3",
      title: "Vous diffusez le lien",
      titleMobile: "Vous diffusez",
      description: "Vous partagez un lien d'inscription aux habitants.",
      descriptionMobile: "Partagez le lien aux habitants."
    },
    { 
      icon: MessageSquare, 
      number: "4",
      title: "Switchly négocie",
      titleMobile: "Switchly négocie",
      description: "Nous négocions avec les fournisseurs pour obtenir les meilleurs tarifs.",
      descriptionMobile: "Négociation avec les fournisseurs."
    },
    { 
      icon: UserCheck, 
      number: "5",
      title: "Offres personnalisées",
      titleMobile: "Offres envoyées",
      description: "Les habitants reçoivent une offre personnalisée.",
      descriptionMobile: "Offres envoyées aux habitants."
    }
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
                <span className="hidden sm:inline">Retour à l'accueil</span>
                <span className="sm:hidden">Retour</span>
              </Link>
            </Button>
          </nav>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-16" />

        {/* Hero */}
        <section className="relative py-12 md:py-20 overflow-hidden">
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
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 md:mb-6"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">Collectivités & Partenaires</span>
              </motion.div>

              <h1 className="text-[22px] leading-tight sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-6">
                Organiser un{" "}
                <span className="gradient-text">achat groupé d'énergie</span>{" "}
                dans votre ville
              </h1>
              <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                <span className="hidden md:inline">Switchly accompagne les collectivités et partenaires locaux dans la mise en place de campagnes d'achats groupés d'électricité et d'internet pour les habitants.</span>
                <span className="md:hidden">Accompagnement des collectivités pour les achats groupés.</span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pourquoi un achat groupé local */}
        <section className="py-12 md:py-16 lg:py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-[20px] sm:text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-6 text-center">
                Pourquoi un achat groupé local ?
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-10 text-center max-w-2xl mx-auto px-2">
                <span className="hidden md:inline">Les achats groupés permettent de négocier des tarifs plus avantageux grâce au regroupement des foyers volontaires, tout en laissant aux habitants la liberté d'accepter ou de refuser l'offre.</span>
                <span className="md:hidden">Négociez des tarifs avantageux pour vos habitants.</span>
              </p>
              <div className="space-y-3 md:space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 md:gap-4 bg-background rounded-xl md:rounded-2xl p-4 md:p-5 border border-border card-hover"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                    </div>
                    <span className="text-sm md:text-base text-foreground font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comment ça fonctionne - Same design as HowItWorksSection */}
        <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-subtle" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 md:mb-16"
            >
              <h2 className="text-[20px] sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-6">
                Comment ça fonctionne ?
              </h2>
              <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                <span className="hidden md:inline">Un processus simple en 5 étapes pour votre territoire</span>
                <span className="md:hidden">5 étapes simples</span>
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-16">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 h-full border border-border card-hover">
                    {/* Number badge */}
                    <div className="absolute -top-2 md:-top-3 left-4 md:left-6 bg-gradient-hero text-primary-foreground text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                      Étape {step.number}
                    </div>

                    {/* Icon */}
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 mt-1 md:mt-2">
                      <step.icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 md:mb-2">
                      <span className="hidden md:inline">{step.title}</span>
                      <span className="md:hidden">{step.titleMobile}</span>
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      <span className="hidden md:inline">{step.description}</span>
                      <span className="md:hidden">{step.descriptionMobile}</span>
                    </p>
                  </div>

                  {/* Connector line - desktop only */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Micro-texte */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-xs md:text-sm text-muted-foreground"
            >
              Switchly n'est pas un fournisseur. Nous organisons des achats groupés indépendants.
            </motion.p>
          </div>
        </section>

        {/* À qui s'adresse ce dispositif */}
        <section className="py-12 md:py-16 lg:py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-[20px] sm:text-2xl md:text-4xl font-bold text-foreground mb-6 md:mb-12">
                À qui s'adresse ce dispositif ?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
                {targets.map((target, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-5 bg-background rounded-xl md:rounded-2xl border border-border card-hover"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center">
                      <target.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <span className="text-xs md:text-base font-medium text-foreground text-center">{target.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - matching CTASection style */}
        <section className="py-12 md:py-16 lg:py-20">
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
                  <span className="hidden md:inline">Contactez-nous pour étudier la mise en place d'une campagne pour votre territoire.</span>
                  <span className="md:hidden">Contactez-nous dès maintenant.</span>
                </p>
                {/* CTA - hidden on mobile (using fixed CTA instead) */}
                <div className="hidden md:flex justify-center">
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
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer simple */}
        <footer className="border-t border-border py-6 md:py-8 bg-card">
          <div className="container mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </footer>

        {/* Fixed CTA for mobile */}
        <MobileFixedCTAPartenaire />
        
        {/* Spacer for fixed CTA on mobile */}
        <div className="h-20 md:hidden" />
      </div>
    </PageTransition>
  );
};

export default OrganiserAchatGroupe;
