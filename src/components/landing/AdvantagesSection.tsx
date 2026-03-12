import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, MessageSquare, Shield, Zap, Flame } from "lucide-react";

const advantages = [
  {
    icon: MessageSquare,
    title: "100% en ligne",
    description: "Tout se fait en ligne, sans démarchage téléphonique. Simple et rapide.",
    descriptionMobile: "En ligne, zéro appel.",
    color: "primary",
  },
  {
    icon: TrendingDown,
    title: "300€ économisés/an",
    description: "Économie moyenne constatée sur les factures d'électricité et gaz.",
    descriptionMobile: "Économie moyenne constatée.",
    color: "secondary",
  },
  {
    icon: Shield,
    title: "Fournisseurs reconnus",
    description: "EDF, Engie, TotalEnergies, OHM Énergie... Uniquement des acteurs établis.",
    descriptionMobile: "EDF, Engie, TotalEnergies...",
    color: "primary",
  },
  {
    icon: Scale,
    title: "0€ si vous refusez",
    description: "Vous restez libre. Si l'offre ne convient pas, vous ne payez rien.",
    descriptionMobile: "Libre de refuser, 0€ à payer.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-card">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-10"
        >
          <span className="inline-block text-secondary font-semibold text-xs uppercase tracking-wide mb-2">
            Nos avantages
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
            Pourquoi choisir Switchly ?
          </h2>
          <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">Électricité</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">
              <Flame className="w-3 h-3" />
              <span className="text-xs font-medium">Gaz</span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Des économies réelles, sans risque et sans engagement.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 mb-6 lg:mb-10">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-lg lg:rounded-2xl p-3 lg:p-8 h-full border border-border card-hover text-center">
                <div
                  className={`w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-2xl mx-auto mb-2 lg:mb-6 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-5 h-5 lg:w-8 lg:h-8 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>
                <h3 className="text-xs lg:text-xl font-semibold text-foreground mb-1 lg:mb-3">
                  {advantage.title}
                </h3>
                <p className="text-[10px] lg:text-base text-muted-foreground leading-tight">
                  <span className="hidden lg:inline">{advantage.description}</span>
                  <span className="lg:hidden">{advantage.descriptionMobile}</span>
                </p>
              </div>
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
            <Link to="/comparer">Comparer gratuitement →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
