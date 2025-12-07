import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Users, Gift } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Vous vous inscrivez en 20 secondes",
    description:
      "Indiquez vos besoins (internet, électricité ou les deux).",
  },
  {
    icon: Users,
    number: "02",
    title: "Nous négocions pour tout le groupement",
    description:
      "Plus il y a d'inscrits, plus la remise est importante.",
  },
  {
    icon: Gift,
    number: "03",
    title: "Vous recevez une offre personnalisée",
    description:
      "Vous décidez si vous souhaitez souscrire ou non.",
  },
];

export function HowItWorksSection() {
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
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent pour économiser sur vos factures
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-background rounded-2xl p-8 h-full border border-border card-hover">
                {/* Number badge */}
                <div className="absolute -top-4 left-8 bg-gradient-hero text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Étape {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
              )}
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
            <Link to="/inscription">Créer mon compte</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
