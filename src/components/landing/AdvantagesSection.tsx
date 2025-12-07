import { motion } from "framer-motion";
import { Sparkles, MapPin, PhoneOff, Wallet } from "lucide-react";

const advantages = [
  {
    icon: Sparkles,
    title: "Aucune démarche compliquée",
    description: "Nous comparons & négocions pour vous.",
    color: "primary",
  },
  {
    icon: MapPin,
    title: "Offre collective",
    description: "Votre réduction dépend du nombre de participants.",
    color: "secondary",
  },
  {
    icon: PhoneOff,
    title: "Pas d'appel commercial",
    description: "100% digital, aucune pression.",
    color: "primary",
  },
  {
    icon: Wallet,
    title: "Économies réelles",
    description: "Jusqu'à 400€/an sur deux contrats.",
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
            Pourquoi choisir <span className="gradient-text">Switchly</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des avantages concrets pour votre portefeuille et votre tranquillité
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </section>
  );
}
