import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-[50vh] lg:min-h-[70vh] flex items-center overflow-hidden py-8 lg:py-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:space-y-8 text-center lg:text-left"
          >
            {/* DESKTOP VERSION */}
            <div className="hidden lg:block space-y-6">
              {/* Title - Desktop */}
              <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                Économisez jusqu'à 400€ par an{" "}
                <span className="gradient-text">sur vos factures d'énergie</span>
              </h1>

              {/* Subtitle - Desktop (1 seule phrase) */}
              <p className="text-xl text-muted-foreground max-w-xl">
                Achat groupé gratuit et sans engagement. Plus on est nombreux, plus les prix baissent.
              </p>

              {/* CTA Button - Desktop */}
              <div className="flex flex-col items-start gap-3 pt-2">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Button variant="hero" size="xl" className="text-lg py-6 px-10" asChild>
                    <Link to="/inscription">
                      Rejoindre l'achat groupé gratuitement
                    </Link>
                  </Button>
                </motion.div>
                <p className="text-sm text-muted-foreground">Gratuit • Sans engagement • Résultat en 48h</p>
              </div>
            </div>

            {/* MOBILE VERSION - Ultra allégée */}
            <div className="lg:hidden space-y-4">
              {/* Title - Mobile */}
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Payez moins cher{" "}
                <span className="gradient-text">votre électricité</span>
              </h1>

              {/* Subtitle - Mobile (1 seule phrase courte) */}
              <p className="text-base text-muted-foreground">
                Achat groupé gratuit, sans engagement
              </p>

              {/* Micro-texte mobile sous le CTA fixe */}
              <p className="text-xs text-muted-foreground pt-2">
                30 secondes • Sans engagement
              </p>
            </div>
          </motion.div>

          {/* Visual - desktop only: Preuve sociale unique */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main card - Social proof */}
            <div className="relative bg-card rounded-3xl p-10 shadow-switchly-xl border border-border text-center">
              <div className="space-y-4">
                {/* Social proof counter */}
                <div className="text-5xl font-bold text-foreground">2 547</div>
                <p className="text-xl text-muted-foreground">
                  <span className="font-semibold text-foreground">foyers déjà inscrits</span> cette semaine
                </p>
                <p className="text-sm text-secondary font-medium">
                  Plus on est nombreux, plus on économise
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
