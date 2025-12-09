import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Clock, Eye } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "Économies importantes",
    description: "Profitez de tarifs négociés grâce au volume.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "Sans engagement",
    description: "Vous participez librement et vous pouvez refuser l'offre.",
    color: "secondary",
  },
  {
    icon: Clock,
    title: "Simplicité totale",
    description: "Nous gérons la négociation à votre place.",
    color: "primary",
  },
  {
    icon: Eye,
    title: "Transparence",
    description: "Vous voyez l'offre clairement avant toute décision.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Pourquoi rejoindre Switchly ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Des avantages concrets pour votre portefeuille et votre tranquillité
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 mb-12 md:mb-16">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-6 md:p-8 h-full border border-border card-hover text-center">
                {/* Icon */}
                <div
                  className={`w-16 md:w-18 h-16 md:h-18 rounded-2xl mx-auto mb-4 md:mb-5 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-8 md:w-9 h-8 md:h-9 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  {advantage.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground">
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
          className="flex justify-center"
        >
          <Button variant="hero" size="xl" className="w-full max-w-md sm:w-auto py-7 sm:py-5 text-base sm:text-lg mx-4 sm:mx-0" asChild>
            <Link to="/inscription">Je veux profiter de l'offre négociée</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
