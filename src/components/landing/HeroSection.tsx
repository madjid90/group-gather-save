import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedCounter, useAnimatedSocialProof } from "@/components/ui/AnimatedCounter";
import { CheckCircle, MessageSquare, Gift, Zap, Wifi, Flame } from "lucide-react";
import { trackClick } from "@/hooks/useClickTracking";

// Memoize static elements
const TrustBadges = memo(() => (
  <div className="flex items-center gap-3 flex-wrap">
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
      <MessageSquare className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-foreground">100% digital</span>
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
      <Gift className="w-4 h-4 text-secondary" />
      <span className="text-sm font-medium text-foreground">100% gratuit</span>
    </div>
  </div>
));
TrustBadges.displayName = "TrustBadges";

export const HeroSection = memo(function HeroSection() {
  const { count, notification } = useAnimatedSocialProof(2547, 12000);

  return (
    <section className="relative min-h-[80svh] lg:min-h-[100svh] flex items-center overflow-hidden py-8 sm:py-10 lg:py-0">
      {/* Background gradient - simplified for performance */}
      <div className="absolute inset-0 bg-gradient-subtle" aria-hidden="true" />
      
      {/* Animated background - desktop only, reduced motion */}
      <div className="absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl opacity-30" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Mobile counter - top */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:hidden flex items-center justify-center mb-4"
          >
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2.5 shadow-lg">
              <motion.span 
                className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-xs font-semibold"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground animate-pulse" />
                en direct
              </motion.span>
              <span className="text-xl font-bold text-foreground">
                <AnimatedCounter 
                  target={2547}
                  externalValue={count}
                  duration={2}
                  showLiveIndicator={false}
                />
              </span>
              <span className="text-sm text-muted-foreground">inscrits</span>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:space-y-8 text-center lg:text-left"
          >
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
              Économisez jusqu'à <span className="gradient-text">400€</span> par an sur vos factures{" "}
              <span className="gradient-text">d'électricité, gaz et internet</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl">
              Achat groupé sans engagement. Plus on est nombreux, plus les prix baissent.
            </p>

            {/* CTA Button - Desktop only */}
            <div className="hidden lg:flex flex-col items-start gap-4 pt-2">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="text-lg py-6 px-10" 
                  asChild
                  onClick={() => trackClick({ eventType: 'cta_inscription', source: 'hero' })}
                >
                  <Link to="/inscription">
                    Rejoindre l'achat groupé gratuitement
                  </Link>
                </Button>
              </motion.div>
              {/* Trust badges below CTA */}
              <TrustBadges />
            </div>
            
            {/* Trust badges - Mobile only */}
            <div className="lg:hidden flex items-center justify-center gap-2 flex-wrap">
              <TrustBadges />
            </div>
            
            {/* Scroll indicator - Mobile/Tablet only */}
            <motion.div 
              className="lg:hidden pt-4 flex justify-center"
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
            <div className="relative">
              {/* Floating counter card */}
              <motion.div 
                className="relative bg-card rounded-2xl p-8 shadow-switchly-xl border border-border text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                {/* Live indicator - top left */}
                <motion.div 
                  className="absolute -top-2 -left-2 flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.4)",
                      "0 0 0 8px rgba(34, 197, 94, 0)",
                      "0 0 0 0 rgba(34, 197, 94, 0)"
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-secondary-foreground animate-pulse" />
                  <span className="text-xs font-semibold">en direct</span>
                </motion.div>

                <div className="text-5xl font-bold text-foreground">
                  <AnimatedCounter 
                    target={2547}
                    externalValue={count}
                    duration={2.5}
                    showLiveIndicator={false}
                  />
                </div>
                <p className="text-lg text-muted-foreground mt-2">
                  foyers inscrits
                </p>
              </motion.div>

              {/* Savings cards */}
              <motion.div 
                className="flex gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {/* Electricity savings */}
                <div className="flex-1 bg-card rounded-2xl p-4 shadow-switchly border border-border text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Électricité</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">200 €</p>
                  <p className="text-xs text-secondary font-medium">/an estimés</p>
                </div>

                {/* Gas savings */}
                <div className="flex-1 bg-card rounded-2xl p-4 shadow-switchly border border-border text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground">Gaz</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">120 €</p>
                  <p className="text-xs text-secondary font-medium">/an estimés</p>
                </div>

                {/* Internet savings */}
                <div className="flex-1 bg-card rounded-2xl p-4 shadow-switchly border border-border text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Wifi className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-medium text-muted-foreground">Internet</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">80 €</p>
                  <p className="text-xs text-secondary font-medium">/an estimés</p>
                </div>
              </motion.div>

              {/* Social proof notification - always visible with subtle animation */}
              <motion.div
                className="absolute -bottom-16 -left-4 bg-card border border-border rounded-2xl p-3 pr-5 shadow-switchly-lg"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -4, 0], 
                  scale: 1 
                }}
                transition={{ 
                  opacity: { delay: 0.9, duration: 0.3 },
                  scale: { delay: 0.9, duration: 0.3 },
                  y: { delay: 1.2, duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    {notification?.name || "Maxime"} vient de s'inscrire
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification?.city || "Amiens"} • {notification?.time || "il y a 2 min"}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
