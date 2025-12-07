import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, PhoneOff, TrendingDown, Zap, Wifi } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium">Plus de 12 000 membres actifs</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Payez votre{" "}
              <span className="gradient-text">électricité & internet</span>{" "}
              moins cher grâce à l'achat groupé de votre ville.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Inscription 100% gratuite • Sans engagement
              <br />
              Plus nous sommes nombreux, plus l'offre est avantageuse.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/inscription">
                  Rejoindre gratuitement le groupement de ma ville
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneOff className="w-5 h-5 text-destructive" />
                <span>Aucun appel commercial</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="w-5 h-5 text-secondary" />
                <span>Jusqu'à 400€/an d'économies</span>
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

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Membres du groupement</span>
                    <span className="font-medium text-foreground">
                      <AnimatedCounter value={847} />
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-hero rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "67%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Objectif : 1 250 membres pour une réduction maximale
                  </p>
                </div>

                {/* Countdown */}
                <div className="bg-primary/5 rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">Prochaine négociation dans</p>
                  <div className="flex gap-3">
                    {[
                      { value: 12, label: "jours" },
                      { value: 8, label: "heures" },
                      { value: 45, label: "min" },
                    ].map((item) => (
                      <div key={item.label} className="bg-card rounded-lg p-2 text-center flex-1">
                        <div className="text-xl font-bold text-primary">
                          <AnimatedCounter value={item.value} duration={1} />
                        </div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
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
