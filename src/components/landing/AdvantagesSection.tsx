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
    descriptionMobile: "Participez librement.",
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
    descriptionMobile: "Offre claire avant décision.",
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
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-6">
            Pourquoi rejoindre Switchly ?
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden md:inline">Des avantages concrets pour votre portefeuille et votre tranquillité</span>
            <span className="md:hidden">Des avantages concrets pour vous</span>
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
                  <span className="md:hidden">{advantage.descriptionMobile || advantage.description}</span>
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
