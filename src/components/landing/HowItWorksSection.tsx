import { motion } from "framer-motion";
import { Search, BarChart3, MousePointerClick } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Entrez votre code postal",
    description: "En 10 secondes, on identifie toutes les offres disponibles dans votre secteur.",
  },
  {
    icon: BarChart3,
    number: "2",
    title: "Comparez les offres",
    description: "Prix au kWh, abonnement, économies vs EDF — tout est transparent et clair.",
  },
  {
    icon: MousePointerClick,
    number: "3",
    title: "Souscrivez en ligne",
    description: "Cliquez sur l'offre choisie. Tout se fait en ligne en 5 minutes, sans appel.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-widest mb-3">
            Comment ça marche
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Comparer et économiser en 3 étapes
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Un processus simple et transparent pour trouver la meilleure offre énergie.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-2xl p-6 h-full">
                {/* Step badge */}
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full mb-4">
                  Étape {step.number}
                </div>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>

                {/* Text */}
                <h3 className="font-semibold text-base text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Connector arrow — desktop only */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-3 z-10 w-6 h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
