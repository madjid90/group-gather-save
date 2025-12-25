import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedCounter, useAnimatedSocialProof } from "@/components/ui/AnimatedCounter";
import { CheckCircle, Zap, Wifi } from "lucide-react";

export function HeroSection() {
  const { count, notification, showNotification } = useAnimatedSocialProof(2547, 12000);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden py-8 lg:py-0">
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
            {/* Title - same for all */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-foreground leading-tight text-center lg:text-left">
              Économisez jusqu'à <span className="gradient-text">400€</span> par an sur vos factures{" "}
              <span className="gradient-text">d'énergie et d'internet</span>
            </h1>

            {/* Subtitle with service icons */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Électricité</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Internet</span>
                </div>
              </div>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl text-center lg:text-left">
                Achat groupé gratuit et sans engagement. Plus on est nombreux, plus les prix baissent.
              </p>
            </div>

            {/* CTA Button - Desktop only */}
            <div className="hidden lg:flex flex-col items-start gap-3 pt-2">
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
              <p className="text-sm text-muted-foreground">Gratuit • Sans engagement</p>
            </div>
            
            {/* Scroll indicator - Mobile/Tablet only */}
            <motion.div 
              className="lg:hidden pt-8 flex justify-center"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
                <motion.div 
                  className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Visual - desktop only */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative flex items-center justify-center min-h-[300px]">
              {/* Floating counter card */}
              <motion.div 
                className="bg-card rounded-2xl p-8 shadow-switchly-xl border border-border text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-5xl font-bold text-foreground">
                  <AnimatedCounter 
                    target={2547}
                    externalValue={count}
                    duration={2.5}
                    showLiveIndicator={true}
                  />
                </div>
                <p className="text-lg text-muted-foreground mt-2">
                  foyers inscrits
                </p>
              </motion.div>
            </div>

            {/* Floating notification - animated with real data */}
            <AnimatePresence>
              {showNotification && notification && (
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-switchly-lg"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {notification.name} vient de s'inscrire
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.city} • {notification.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
