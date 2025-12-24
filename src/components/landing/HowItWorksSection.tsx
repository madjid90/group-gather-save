import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Users, Gift } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Inscrivez-vous en 30 secondes",
    titleMobile: "Inscription en 30 sec",
    description: "Email + quelques infos sur votre logement. Gratuit et sans engagement.",
    descriptionMobile: "Email + infos logement. Gratuit.",
  },
  {
    icon: Users,
    number: "2",
    title: "On négocie pour vous",
    titleMobile: "On négocie pour vous",
    description: "Plus vous êtes nombreux, plus notre pouvoir de négociation augmente.",
    descriptionMobile: "Pouvoir collectif = meilleurs prix.",
  },
  {
    icon: Gift,
    number: "3",
    title: "Vous recevez votre offre",
    titleMobile: "Offre reçue sous 48h",
    description: "Comparez et décidez librement. Si ça ne convient pas, vous ne faites rien.",
    descriptionMobile: "Libre d'accepter ou refuser.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-10 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-14"
        >
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-6">
            Comment ça marche
          </h2>
          <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden lg:inline">3 étapes simples pour économiser sur vos factures</span>
            <span className="lg:hidden">3 étapes simples</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-card rounded-xl lg:rounded-2xl p-5 lg:p-8 h-full border border-border card-hover">
                {/* Number badge */}
                <div className="absolute -top-2 lg:-top-4 left-5 lg:left-8 bg-gradient-hero text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Étape {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 lg:mb-6 mt-2">
                  <step.icon className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-base lg:text-xl font-semibold text-foreground mb-2 lg:mb-4">
                  <span className="hidden lg:inline">{step.title}</span>
                  <span className="lg:hidden">{step.titleMobile}</span>
                </h3>
                <p className="text-sm lg:text-lg text-muted-foreground">
                  <span className="hidden lg:inline">{step.description}</span>
                  <span className="lg:hidden">{step.descriptionMobile}</span>
                </p>
              </div>

              {/* Connector line - desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
              )}
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
            <Link to="/inscription">Rejoindre l'achat groupé gratuitement</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
