import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Gift, Eye, ShieldCheck } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "Des économies immédiates",
    description: "Jusqu'à 400€ d'économies par an selon votre profil.",
    color: "primary",
  },
  {
    icon: Gift,
    title: "100 % gratuit et sans engagement",
    description: "Aucun frais. Aucune obligation. Vous êtes libre à chaque étape.",
    color: "secondary",
  },
  {
    icon: Eye,
    title: "Une transparence totale",
    description: "Nos offres sont basées sur votre consommation réelle. Pas de surprise.",
    color: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Données protégées",
    description: "Vos informations sont anonymisées avant d'être partagées aux fournisseurs.",
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-6">
            Pourquoi rejoindre Switchly ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Des avantages concrets pour votre portefeuille et votre tranquillité
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-10 md:mb-16">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-5 md:p-8 h-full border border-border card-hover text-center">
                {/* Icon */}
                <div
                  className={`w-14 md:w-18 h-14 md:h-18 rounded-2xl mx-auto mb-4 md:mb-5 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-7 md:w-9 h-7 md:h-9 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-base md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                  {advantage.title}
                </h3>
                <p className="text-sm md:text-lg text-muted-foreground">
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
          <Button variant="hero" size="lg" className="w-full sm:w-auto py-6 sm:py-5 text-base sm:text-lg" asChild>
            <Link to="/inscription">Rejoindre gratuitement le groupe</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Sans engagement — vous restez libre à 100 %.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
