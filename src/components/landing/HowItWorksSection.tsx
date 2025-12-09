import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Users, Gift } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Inscrivez-vous en 1 minute",
    description:
      "Indiquez simplement vos informations et votre code postal.",
  },
  {
    icon: Users,
    number: "2",
    title: "Nous négocions pour tout le groupe",
    description:
      "Plus nous sommes nombreux, plus nous obtenons de meilleurs tarifs auprès des fournisseurs.",
  },
  {
    icon: Gift,
    number: "3",
    title: "Recevez une offre négociée",
    description:
      "Vous êtes libre d'accepter ou de refuser. Aucun changement sans votre accord.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Comment fonctionne Switchly ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Un processus simple et transparent pour économiser sur vos factures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 mb-12 md:mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-background rounded-2xl p-6 md:p-8 h-full border border-border card-hover">
                {/* Number badge */}
                <div className="absolute -top-3 md:-top-4 left-6 md:left-8 bg-gradient-hero text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Étape {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 md:w-16 h-14 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 md:mb-6 mt-2">
                  <step.icon className="w-7 md:w-8 h-7 md:h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">
                  {step.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground">{step.description}</p>
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
          className="flex justify-center"
        >
          <Button variant="hero" size="xl" className="w-full max-w-md sm:w-auto py-7 sm:py-5 text-base sm:text-lg mx-4 sm:mx-0" asChild>
            <Link to="/inscription">Je participe à l'achat groupé</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
