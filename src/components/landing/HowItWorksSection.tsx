import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, BarChart3, MousePointerClick } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Entrez votre code postal",
    titleMobile: "Votre code postal",
    description: "En 10 secondes, on identifie toutes les offres disponibles dans votre secteur.",
    descriptionMobile: "Offres disponibles dans votre zone.",
  },
  {
    icon: BarChart3,
    number: "2",
    title: "Comparez les offres",
    titleMobile: "Comparez les offres",
    description: "Prix au kWh, abonnement mensuel, économies vs EDF — tout est transparent.",
    descriptionMobile: "Prix, abonnement, économies — tout est clair.",
  },
  {
    icon: MousePointerClick,
    number: "3",
    title: "Souscrivez en ligne",
    titleMobile: "Souscrivez en ligne",
    description: "Cliquez sur l'offre de votre choix. Tout se fait en ligne, sans appel.",
    descriptionMobile: "En ligne, sans appel.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-10 sm:py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-10"
        >
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-wide mb-2">
            Comment ça marche
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
            Comparer et économiser en 3 étapes
          </h2>
          <p className="text-[13px] leading-relaxed lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent pour trouver la meilleure offre énergie ou internet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-card rounded-lg lg:rounded-2xl p-3 lg:p-8 h-full border border-border card-hover">
                <div className="absolute -top-2 lg:-top-4 left-3 lg:left-8 bg-gradient-hero text-primary-foreground text-[10px] lg:text-xs font-bold px-2 lg:px-3 py-0.5 lg:py-1 rounded-full">
                  Étape {step.number}
                </div>
                <div className="w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-2xl bg-primary/10 flex items-center justify-center mb-2 lg:mb-6 mt-1 mx-auto lg:mx-0">
                  <step.icon className="w-5 h-5 lg:w-8 lg:h-8 text-primary" />
                </div>
                <h3 className="text-xs lg:text-xl font-semibold text-foreground mb-1 lg:mb-4 text-center lg:text-left">
                  <span className="hidden lg:inline">{step.title}</span>
                  <span className="lg:hidden">{step.titleMobile}</span>
                </h3>
                <p className="text-[10px] lg:text-lg text-muted-foreground text-center lg:text-left leading-tight">
                  <span className="hidden lg:inline">{step.description}</span>
                  <span className="lg:hidden">{step.descriptionMobile}</span>
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
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
          <Button variant="hero" size="xl" className="py-6 px-10 text-lg" asChild>
            <Link to="/comparer">Comparer gratuitement</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
