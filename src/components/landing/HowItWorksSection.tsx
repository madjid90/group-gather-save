import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Users, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Inscrivez-vous en 30 secondes",
    titleMobile: "Inscription en 30 sec",
    description: "Téléphone + quelques infos sur votre logement. Gratuit et sans engagement.",
    descriptionMobile: "Téléphone + infos logement. Gratuit.",
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
    icon: MessageSquare,
    number: "3",
    title: "Recevez votre offre par SMS",
    titleMobile: "Offre reçue par SMS",
    description: "Vous recevez votre offre personnalisée par SMS. Comparez et décidez librement sur votre espace.",
    descriptionMobile: "Offre par SMS, décision libre.",
  },
  {
    icon: CheckCircle,
    number: "4",
    title: "On s'occupe de tout",
    titleMobile: "On gère les démarches",
    description: "Si vous acceptez, nous faisons les démarches auprès du nouveau fournisseur. Vous n'avez rien à faire.",
    descriptionMobile: "Démarches faites pour vous.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-12 sm:py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wide mb-3">
            Comment ça marche
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4">
            Rejoignez l'achat groupé en 4 étapes
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent pour économiser sur vos factures d'électricité, gaz et internet sans effort.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
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
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 lg:mb-6 mt-2 mx-auto lg:mx-0">
                  <step.icon className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
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
