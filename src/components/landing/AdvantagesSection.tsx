import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, Scale, Sparkles, ShieldCheck } from "lucide-react";

const advantages = [
  {
    icon: TrendingDown,
    title: "Des tarifs exclusifs grâce au volume",
    description: "Vous accédez à des prix réservés aux achats groupés, indisponibles pour un particulier.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "Une démarche 100 % indépendante",
    description: "Nous sélectionnons uniquement les offres réellement avantageuses.",
    color: "secondary",
  },
  {
    icon: Sparkles,
    title: "Aucune démarche compliquée",
    description: "On compare et on négocie pour vous. Vous recevez directement le meilleur prix.",
    color: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Vous gardez le contrôle",
    description: "Vous êtes libre d'accepter ou refuser l'offre finale, sans engagement.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi payer vos contrats plus cher alors que le collectif permet d'obtenir mieux ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des avantages concrets pour votre portefeuille et votre tranquillité
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-6 h-full border border-border card-hover text-center">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    advantage.color === "primary"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <advantage.icon
                    className={`w-8 h-8 ${
                      advantage.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {advantage.title}
                </h3>
                <p className="text-muted-foreground text-sm">
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
          className="text-center"
        >
          <Button variant="hero" size="lg" asChild>
            <Link to="/inscription">Je veux profiter de l'offre négociée</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
