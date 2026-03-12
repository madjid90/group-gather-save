import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, BarChart3, MousePointerClick, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Entrez votre code postal",
    titleMobile: "Votre code postal",
    description: "En 10 secondes, on identifie toutes les offres disponibles dans votre secteur.",
    descriptionMobile: "Offres disponibles dans votre zone.",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Comparez les offres",
    titleMobile: "Comparez les offres",
    description: "Prix au kWh, abonnement mensuel, économies vs EDF — tout est transparent.",
    descriptionMobile: "Prix, abonnement, économies — tout est clair.",
  },
  {
    icon: MousePointerClick,
    number: "03",
    title: "Souscrivez en ligne",
    titleMobile: "Souscrivez en ligne",
    description: "Cliquez sur l'offre de votre choix. Tout se fait en ligne, sans appel.",
    descriptionMobile: "En ligne, sans appel.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-section-mobile lg:py-section-desktop bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Comment ça marche
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Comparer en <span className="gradient-text">3 étapes</span>
          </h2>
          <p className="text-sm lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent pour trouver la meilleure offre.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              <div className="bg-card rounded-2xl p-5 lg:p-8 h-full border border-border/60 card-hover relative overflow-hidden">
                {/* Large faded number */}
                <div className="absolute -top-2 -right-2 text-[80px] lg:text-[100px] font-black text-muted/30 leading-none select-none pointer-events-none">
                  {step.number}
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 lg:mb-6 transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <h3 className="text-sm lg:text-xl font-bold text-foreground mb-2 lg:mb-3">
                    <span className="hidden lg:inline">{step.title}</span>
                    <span className="lg:hidden">{step.titleMobile}</span>
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                    <span className="hidden lg:inline">{step.description}</span>
                    <span className="lg:hidden">{step.descriptionMobile}</span>
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-3 w-6 z-10">
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden lg:flex justify-center"
        >
          <Button variant="hero" size="xl" className="px-12" asChild>
            <Link to="/comparer">Comparer gratuitement <ArrowRight className="w-5 h-5 ml-1" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
