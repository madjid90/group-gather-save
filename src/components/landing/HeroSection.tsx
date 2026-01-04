import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedCounter, useAnimatedSocialProof } from "@/components/ui/AnimatedCounter";
import { CheckCircle, MessageSquare, Gift, Zap, Wifi, Flame, Bell, TrendingUp, Calendar, Clock } from "lucide-react";
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

// Dashboard-style hero visual
const HeroDashboard = memo(({ count, notification }: { count: number; notification: { name: string; city: string; time: string } | null }) => {
  const recentMembers = [
    { time: "10:00", name: "Marie D.", type: "Électricité + Gaz", status: "inscrit" },
    { time: "11:30", name: "Sophie L.", type: "Électricité", status: "inscrit" },
    { time: "14:00", name: "Emma R.", type: "Internet + Énergie", status: "en_attente" },
  ];

  return (
    <div className="relative">
      {/* Floating notification - top right */}
      <motion.div
        className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-switchly-lg flex items-center gap-3 z-10"
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Nouvelle inscription</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            {notification?.name || "Maxime"} confirmé
            <CheckCircle className="w-4 h-4 text-secondary" />
          </p>
        </div>
      </motion.div>

      {/* Calendar icon - decorative */}
      <motion.div
        className="absolute top-16 -right-2 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center z-10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <Calendar className="w-5 h-5 text-destructive" />
      </motion.div>

      {/* Main dashboard card */}
      <motion.div
        className="bg-card rounded-3xl p-6 shadow-switchly-xl border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Aujourd'hui</p>
          <h3 className="text-2xl font-bold text-foreground">
            <AnimatedCounter 
              target={count}
              externalValue={count}
              duration={2}
              showLiveIndicator={false}
            /> inscrits
          </h3>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            className="bg-muted/50 rounded-xl p-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-xl font-bold text-foreground">312€</p>
            <p className="text-xs text-muted-foreground">Économie moy.</p>
            <p className="text-xs font-semibold text-secondary">+15%</p>
          </motion.div>
          <motion.div
            className="bg-muted/50 rounded-xl p-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xl font-bold text-foreground">98%</p>
            <p className="text-xs text-muted-foreground">Satisfaits</p>
            <p className="text-xs font-semibold text-secondary">+12%</p>
          </motion.div>
          <motion.div
            className="bg-muted/50 rounded-xl p-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Offres</p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 text-primary" />
              <Flame className="w-3 h-3 text-orange-500" />
              <Wifi className="w-3 h-3 text-secondary" />
            </div>
          </motion.div>
        </div>

        {/* Recent members list */}
        <div className="space-y-3">
          {recentMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-background rounded-xl p-3 flex items-center gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground w-12">{member.time}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.type}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                member.status === "inscrit" 
                  ? "bg-secondary/20 text-secondary" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}>
                {member.status === "inscrit" ? "Confirmé" : "En attente"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom floating stat */}
      <motion.div
        className="absolute -bottom-8 -left-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-switchly-lg flex items-center gap-3"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: [0, -4, 0], 
          scale: 1 
        }}
        transition={{ 
          opacity: { delay: 1.2, duration: 0.3 },
          scale: { delay: 1.2, duration: 0.3 },
          y: { delay: 1.5, duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-destructive" />
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Cette semaine</p>
          <p className="text-sm font-bold text-foreground">+23% d'inscriptions</p>
        </div>
      </motion.div>
    </div>
  );
});
HeroDashboard.displayName = "HeroDashboard";

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
              Économisez jusqu'à <span className="gradient-text">312€</span> par an sur vos factures{" "}
              <span className="gradient-text">d'énergie et internet</span>
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

          {/* Visual - desktop only - Dashboard style */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <HeroDashboard count={count} notification={notification} />
          </motion.div>
        </div>
      </div>
    </section>
  );
});
