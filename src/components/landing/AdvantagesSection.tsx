import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, MessageSquare, Shield, ArrowRight } from "lucide-react";

const advantages = [
  {
    icon: MessageSquare,
    title: "100% en ligne",
    description: "Tout se fait en ligne, sans démarchage téléphonique. Simple et rapide.",
    descriptionMobile: "En ligne, zéro appel.",
    gradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: TrendingDown,
    title: "300€ économisés/an",
    description: "Économie moyenne constatée sur les factures d'électricité et gaz.",
    descriptionMobile: "Économie moyenne constatée.",
    gradient: "from-secondary/10 to-secondary/5",
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
  },
  {
    icon: Shield,
    title: "Fournisseurs reconnus",
    description: "EDF, Engie, TotalEnergies, OHM Énergie... Uniquement des acteurs établis.",
    descriptionMobile: "EDF, Engie, TotalEnergies...",
    gradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: Scale,
    title: "0€ si vous refusez",
    description: "Vous restez libre. Si l'offre ne convient pas, vous ne payez rien.",
    descriptionMobile: "Libre de refuser, 0€ à payer.",
    gradient: "from-secondary/10 to-secondary/5",
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-section-mobile lg:py-section-desktop relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle" aria-hidden="true" />
      
      <div className="container mx-auto px-4 sm:px-6 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
            Nos avantages
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Pourquoi choisir <span className="gradient-text">Switchly</span> ?
          </h2>
          <p className="text-sm lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Des économies réelles, sans risque et sans engagement.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-8 lg:mb-12">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className={`relative bg-card rounded-2xl p-4 lg:p-7 h-full border border-border/60 card-hover text-center overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${advantage.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${advantage.iconBg} mx-auto mb-3 lg:mb-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <advantage.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${advantage.iconColor}`} />
                  </div>
                  <h3 className="text-sm lg:text-lg font-bold text-foreground mb-1.5 lg:mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                    <span className="hidden lg:inline">{advantage.description}</span>
                    <span className="lg:hidden">{advantage.descriptionMobile}</span>
                  </p>
                </div>
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
          <Button variant="hero" size="xl" className="px-12" asChild>
            <Link to="/comparer">Comparer gratuitement <ArrowRight className="w-5 h-5 ml-1" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
