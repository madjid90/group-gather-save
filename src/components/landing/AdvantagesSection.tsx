import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Clock, Eye } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "Jusqu'à 400 € d'économies par an",
    description: "Profitez d'offres négociées permettant de réduire votre facture d'électricité et d'internet.",
    descriptionMobile: "Jusqu'à 400€/an d'économies.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "Aucun engagement, aucune obligation",
    description: "Participez librement à l'achat groupé, refusez l'offre si elle ne vous convient pas.",
    descriptionMobile: "Refusez si ça ne convient pas.",
    color: "secondary",
  },
  {
    icon: Clock,
    title: "Aucune démarche, nous nous occupons de tout",
    description: "Nous négocions pour vous auprès des fournisseurs d'énergie et d'internet, sans aucune démarche.",
    descriptionMobile: "Aucune démarche de votre part.",
    color: "primary",
  },
  {
    icon: Eye,
    title: "Offres claires, fournisseurs reconnus",
    description: "Vous recevez une offre claire, détaillée et sans frais cachés de fournisseurs reconnus.",
    descriptionMobile: "Offre claire, sans frais cachés.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-10 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-14"
        >
          <h2 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 lg:mb-6">
            Pourquoi rejoindre Switchly ?
          </h2>
          <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden lg:inline">Des avantages concrets pour réduire vos factures durablement</span>
            <span className="lg:hidden">Réduisez vos factures durablement</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-xl lg:rounded-2xl p-5 lg:p-8 h-full border border-border card-hover text-center">
                {/* Icon */}
                <div
                  className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl mx-auto mb-4 lg:mb-6 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-6 h-6 lg:w-8 lg:h-8 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-sm lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">
                  {advantage.title}
                </h3>
                <p className="text-xs lg:text-base text-muted-foreground">
                  <span className="hidden lg:inline">{advantage.description}</span>
                  <span className="lg:hidden">{advantage.descriptionMobile}</span>
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
          className="hidden lg:flex justify-center"
        >
          <Button variant="hero" size="xl" className="py-6 px-10 text-lg" asChild>
            <Link to="/inscription">Je veux profiter de l'offre négociée</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
