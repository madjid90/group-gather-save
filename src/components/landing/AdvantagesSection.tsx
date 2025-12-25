import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Clock, Shield, Zap, Wifi } from "lucide-react";

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
    title: "100% digital par SMS",
    description: "Tout se fait par SMS et sur votre espace. Aucun démarchage téléphonique.",
    descriptionMobile: "Par SMS, zéro appel.",
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
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-16"
        >
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wide mb-3">
            Nos avantages
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 lg:mb-6">
            Pourquoi choisir Switchly ?
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Électricité</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Internet</span>
            </div>
          </div>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Des économies réelles, sans risque et sans engagement. Découvrez les avantages de l'achat groupé.
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
