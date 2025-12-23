import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Clock, Eye } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "312€ économisés en moyenne",
    description: "C'est l'économie moyenne constatée par nos membres sur leur facture annuelle d'électricité et d'internet.",
    descriptionMobile: "Économie moyenne constatée.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "0€ si vous refusez l'offre",
    description: "Vous restez 100% libre. Si l'offre ne vous convient pas, vous ne payez rien et gardez votre contrat actuel.",
    descriptionMobile: "Libre de refuser, 0€ à payer.",
    color: "secondary",
  },
  {
    icon: Clock,
    title: "Offre reçue en 48h",
    description: "Pas de longues démarches. Inscrivez-vous en 30 secondes et recevez votre offre personnalisée sous 48h.",
    descriptionMobile: "30 sec d'inscription, 48h de délai.",
    color: "primary",
  },
  {
    icon: Eye,
    title: "EDF, Engie, TotalEnergies...",
    description: "Nous négocions uniquement avec des fournisseurs reconnus et établis pour des offres transparentes et fiables.",
    descriptionMobile: "Fournisseurs reconnus uniquement.",
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
            Pourquoi 2 500+ foyers nous font confiance
          </h2>
          <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden lg:inline">Des avantages concrets et mesurables pour votre budget</span>
            <span className="lg:hidden">Avantages concrets pour votre budget</span>
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
            <Link to="/inscription">Obtenir mon offre personnalisée →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
