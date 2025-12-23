import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, CheckCircle, Zap, Wifi, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-120px)] lg:min-h-[85vh] flex items-center overflow-hidden py-6 lg:py-0">
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
            className="space-y-5 lg:space-y-8 text-center lg:text-left"
          >
            {/* Badge - Urgence */}
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
              <span className="text-sm font-medium">🔥 Nouvelle négociation en cours — Places limitées</span>
            </motion.div>

            {/* Title - Orienté bénéfice + chiffre précis */}
            <h1 className="text-2xl leading-tight sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-foreground lg:leading-tight">
              Économisez{" "}
              <span className="gradient-text">jusqu'à 400€/an</span>{" "}
              sur vos factures{" "}
              <span className="gradient-text">
                d'électricité et d'internet
              </span>
            </h1>

            {/* Subtitle - Social proof + bénéfice clair */}
            <p className="text-base lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              <span className="hidden lg:inline">Rejoignez les milliers de foyers qui ont déjà réduit leurs factures grâce à notre achat groupé. Inscription gratuite en 30 secondes, sans engagement.</span>
              <span className="lg:hidden">+2 500 foyers nous font confiance. Gratuit, sans engagement, 30 secondes.</span>
            </p>

            {/* CTA Button - desktop only, above the fold */}
            <div className="hidden lg:flex flex-col items-start gap-2 pt-2">
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
                    Obtenir mon offre personnalisée →
                  </Link>
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground">✓ Gratuit • ✓ Sans engagement • ✓ Résultat en 48h</p>
            </div>

            {/* Trust badges - oriented benefits */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 lg:gap-6 pt-2 lg:pt-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Économie moyenne de 250€/an</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base text-muted-foreground">
                <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Données 100% sécurisées</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base text-muted-foreground">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Libre de refuser l'offre</span>
              </div>
            </div>

            {/* CTA Button - hidden on mobile, shown on tablet (md) but not lg */}
            <div className="hidden md:flex lg:hidden justify-center w-full">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Button variant="hero" size="xl" className="w-[calc(100%-2rem)] max-w-md sm:w-auto text-base sm:text-lg py-7 sm:py-5 px-8" asChild>
                  <Link to="/inscription">
                    Obtenir mon offre personnalisée →
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Visual - desktop only */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative bg-card rounded-3xl p-8 shadow-switchly-xl border border-border">
              <div className="space-y-6">
                {/* Social proof counter */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-1">2 547</div>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">foyers inscrits</span> cette semaine
                  </p>
                  <p className="text-sm text-secondary font-medium mt-1">
                    +127 aujourd'hui — Plus on est nombreux, plus on économise
                  </p>
                </div>

                {/* Trust points - benefits oriented */}
                <div className="space-y-3">
                  {[
                    "✓ Économie moyenne constatée : 312€/an",
                    "✓ Fournisseurs partenaires : EDF, Engie, TotalEnergies",
                    "✓ 98% de satisfaction client",
                    "✓ Inscription en 30 secondes chrono",
                  ].map((point, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-foreground">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Stats - more impactful */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-subtle rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Électricité</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">-23%</div>
                    <p className="text-xs text-secondary font-medium">soit ~250€/an</p>
                  </div>
                  <div className="bg-gradient-subtle rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Internet</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">-35%</div>
                    <p className="text-xs text-secondary font-medium">soit ~150€/an</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full shadow-glow-success text-sm font-medium cursor-default"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: [0, -8, 0] 
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: 0.5 },
                scale: { duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{ scale: 1.1 }}
            >
              ⚡ Négociation en cours
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
