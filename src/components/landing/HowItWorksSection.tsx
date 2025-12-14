import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Users, Gift } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Inscrivez-vous gratuitement à l'achat groupé énergie et internet",
    titleMobile: "Inscription en 1 minute",
    description: "Indiquez vos informations pour rejoindre l'achat groupé.",
    descriptionMobile: "Indiquez vos informations.",
  },
  {
    icon: Users,
    number: "2",
    title: "Nous négocions des tarifs d'électricité et d'internet grâce à la force du groupe",
    titleMobile: "Nous négocions pour vous",
    description: "Nous regroupons les foyers inscrits pour négocier des tarifs collectifs auprès des fournisseurs d'énergie et d'internet.",
    descriptionMobile: "On regroupe les foyers pour négocier.",
  },
  {
    icon: Gift,
    number: "3",
    title: "Recevez une offre adaptée à votre logement et décidez librement",
    titleMobile: "Recevez votre offre",
    description: "Vous restez entièrement libre d'accepter ou de refuser l'offre négociée.",
    descriptionMobile: "Libre d'accepter ou de refuser.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-8 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-[20px] sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden md:inline">Un fonctionnement clair basé sur la négociation collective</span>
            <span className="md:hidden">Fonctionnement clair et collectif</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-background rounded-xl md:rounded-2xl p-4 md:p-6 h-full border border-border card-hover">
                {/* Number badge */}
                <div className="absolute -top-2 md:-top-4 left-4 md:left-8 bg-gradient-hero text-primary-foreground text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                  Étape {step.number}
                </div>

                {/* Icon - smaller on mobile */}
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-6 mt-1 md:mt-2">
                  <step.icon className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                </div>

                {/* Content - responsive titles and descriptions */}
                <h3 className="text-base md:text-xl font-semibold text-foreground mb-2 md:mb-4">
                  <span className="hidden md:inline">{step.title}</span>
                  <span className="md:hidden">{step.titleMobile}</span>
                </h3>
                <p className="text-sm md:text-lg text-muted-foreground">
                  <span className="hidden md:inline">{step.description}</span>
                  <span className="md:hidden">{step.descriptionMobile}</span>
                </p>
              </div>

              {/* Connector line - desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Micro-texte explicatif */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mb-6 md:mb-10"
        >
          Switchly n'est pas un fournisseur. Nous organisons des achats groupés indépendants.
        </motion.p>

        {/* CTA - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden md:flex justify-center"
        >
          <Button variant="hero" size="xl" className="w-[calc(100%-2rem)] max-w-md sm:w-auto py-7 sm:py-5 text-base sm:text-lg" asChild>
            <Link to="/inscription">Je participe à l'achat groupé</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
