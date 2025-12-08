import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Home, Handshake, Mail, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Rejoignez gratuitement le groupe",
    description:
      "Plus nous sommes nombreux, plus nous obtenons de meilleurs tarifs.",
  },
  {
    icon: Home,
    number: "2",
    title: "Complétez votre profil logement",
    description:
      "Quelques informations suffisent pour recevoir une estimation personnalisée.",
  },
  {
    icon: Handshake,
    number: "3",
    title: "Nous négocions pour vous",
    description:
      "Nous regroupons les profils similaires et négocions directement avec les fournisseurs.",
  },
  {
    icon: Mail,
    number: "4",
    title: "Recevez votre offre personnalisée",
    description:
      "Une estimation claire, transparente et parfaitement adaptée à votre consommation.",
  },
  {
    icon: ThumbsUp,
    number: "5",
    title: "Vous décidez",
    description:
      "Acceptez uniquement si l'offre vous convient. Sans engagement.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-12 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-6">
            Comment Switchly vous fait économiser
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Un processus simple et transparent pour économiser sur vos factures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-6 mb-10 md:mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-background rounded-2xl p-5 md:p-6 h-full border border-border card-hover">
                {/* Number badge */}
                <div className="absolute -top-3 left-5 bg-gradient-hero text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Étape {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-5 mt-2">
                  <step.icon className="w-6 md:w-7 h-6 md:h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border" />
              )}
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
