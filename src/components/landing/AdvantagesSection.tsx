import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Sparkles, ShieldCheck } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "Économies potentielles importantes",
    description: "Des tarifs négociés grâce au volume.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "Gratuit & sans engagement",
    description: "Vous pouvez refuser l'offre si elle ne vous convient pas.",
    color: "secondary",
  },
  {
    icon: Sparkles,
    title: "Simple & rapide",
    description: "Nous gérons la négociation, vous gagnez du temps.",
    color: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Transparence totale",
    description: "Vous connaissez toujours le tarif proposé avant de décider.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-12 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Pourquoi rejoindre le groupe ?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Des avantages concrets pour votre portefeuille et votre tranquillité
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-5 md:p-6 h-full border border-border card-hover text-center">
                {/* Icon */}
                <div
                  className={`w-14 md:w-16 h-14 md:h-16 rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-7 md:w-8 h-7 md:h-8 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  {advantage.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {advantage.description}
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
          className="text-center px-4"
        >
          <Button variant="hero" size="lg" className="w-full sm:w-auto py-6 sm:py-4 text-base" asChild>
            <Link to="/inscription">Je veux profiter de l'offre négociée</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
