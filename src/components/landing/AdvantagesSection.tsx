import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Clock, Eye } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "Tarifs négociés collectivement",
    description: "Profitez d'offres négociées permettant jusqu'à 400€/an d'économies sur l'électricité et l'internet.",
    descriptionMobile: "Jusqu'à 400€/an d'économies.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "Liberté totale de décision",
    description: "Participez librement, refusez l'offre si elle ne vous convient pas.",
    descriptionMobile: "Refusez si ça ne convient pas.",
    color: "secondary",
  },
  {
    icon: Clock,
    title: "Aucune démarche auprès des fournisseurs",
    description: "Nous négocions pour vous auprès des fournisseurs, sans aucune démarche de votre part.",
    descriptionMobile: "Aucune démarche de votre part.",
    color: "primary",
  },
  {
    icon: Eye,
    title: "Fonctionnement clair et expliqué",
    description: "Vous recevez une offre claire, détaillée et sans frais cachés.",
    descriptionMobile: "Offre claire, sans frais cachés.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-10 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-[20px] sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-6">
            Pourquoi rejoindre Switchly ?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden md:inline">Des avantages concrets pour réduire vos factures durablement</span>
            <span className="md:hidden">Réduisez vos factures durablement</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-16">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-xl md:rounded-2xl p-4 md:p-8 h-full border border-border card-hover text-center">
                {/* Icon - smaller on mobile */}
                <div
                  className={`w-10 h-10 md:w-18 md:h-18 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-5 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-5 h-5 md:w-9 md:h-9 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-sm md:text-xl font-semibold text-foreground mb-1 md:mb-3">
                  {advantage.title}
                </h3>
                <p className="text-xs md:text-lg text-muted-foreground">
                  <span className="hidden md:inline">{advantage.description}</span>
                  <span className="md:hidden">{advantage.descriptionMobile}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden md:flex justify-center"
        >
          <Button variant="hero" size="xl" className="w-[calc(100%-2rem)] max-w-md sm:w-auto py-7 sm:py-5 text-base sm:text-lg" asChild>
            <Link to="/inscription">Je veux profiter de l'offre négociée</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
