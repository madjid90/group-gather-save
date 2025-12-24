import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Clock, Shield } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "312€ économisés/an",
    description: "Économie moyenne constatée par nos membres sur leurs factures.",
    descriptionMobile: "Économie moyenne constatée.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "0€ si vous refusez",
    description: "Vous restez libre. Si l'offre ne convient pas, vous ne payez rien.",
    descriptionMobile: "Libre de refuser, 0€ à payer.",
    color: "secondary",
  },
  {
    icon: Clock,
    title: "Rapide et simple",
    description: "Inscription en 30 secondes, offre personnalisée rapidement.",
    descriptionMobile: "30 sec d'inscription, offre rapide.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "Fournisseurs reconnus",
    description: "EDF, Engie, TotalEnergies... Uniquement des acteurs établis.",
    descriptionMobile: "EDF, Engie, TotalEnergies...",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-14"
        >
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-6">
            Pourquoi Switchly
          </h2>
          <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden lg:inline">Des avantages concrets pour votre budget</span>
            <span className="lg:hidden">Avantages concrets</span>
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
            <Link to="/inscription">Rejoindre l'achat groupé gratuitement</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
