import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, CheckCircle, Zap, Wifi, CheckCircle2 } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-12 md:py-0">
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
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 md:space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 cursor-default"
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-secondary"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-sm font-medium">Plus de 12 000 membres actifs</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Rejoignez notre achat groupé et économisez{" "}
              <span className="gradient-text">jusqu'à 30 %</span>{" "}
              <span className="gradient-text">sur vos factures d'énergie et d'internet.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Plus nous sommes nombreux, plus les fournisseurs baissent les prix — vous profitez gratuitement des tarifs négociés.
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center lg:justify-start w-full">
              <Button variant="hero" size="xl" className="w-[calc(100%-2rem)] max-w-md sm:w-auto text-base sm:text-lg py-7 sm:py-5 px-8" asChild>
                <Link to="/inscription">
                  Je rejoins l'achat groupé gratuitement
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 pt-2 md:pt-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm md:text-base text-muted-foreground">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Jusqu'à -30 % grâce au groupe</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm md:text-base text-muted-foreground">
                <Lock className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Offre 100 % personnalisée</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm md:text-base text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Zéro démarche, zéro engagement</span>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative bg-card rounded-3xl p-8 shadow-switchly-xl border border-border">
              <div className="space-y-6">
                {/* Social proof text */}
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Déjà <span className="font-bold text-foreground"><AnimatedCounter value={12847} /></span> foyers ont rejoint la prochaine négociation.
                  </p>
                  <p className="text-sm text-primary font-medium mt-1">
                    Plus nous sommes nombreux, plus les prix baissent.
                  </p>
                </div>

                {/* Trust points */}
                <div className="space-y-3">
                  {[
                    "Service gratuit et sans engagement",
                    "Offres négociées auprès de fournisseurs reconnus",
                    "Transparence totale, aucune surprise",
                    "Inscription en moins de 30 secondes",
                  ].map((point, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-subtle rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Électricité</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={247} suffix="€" />
                    </div>
                    <p className="text-xs text-secondary font-medium">économisés/an</p>
                  </div>
                  <div className="bg-gradient-subtle rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Internet</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={156} suffix="€" />
                    </div>
                    <p className="text-xs text-secondary font-medium">économisés/an</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full shadow-glow-success text-sm font-medium"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎉 +23 inscrits aujourd'hui
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
