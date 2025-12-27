import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Wifi, Clock } from "lucide-react";
import { trackClick } from "@/hooks/useClickTracking";

export function CTASection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Countdown timer (resets daily)
  useEffect(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Urgency timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Clôture des inscriptions dans{" "}
                  <span className="font-bold tabular-nums">
                    {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Électricité</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Internet</span>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4 lg:mb-6">
              Ne ratez pas cette opportunité
            </h2>
            <p className="text-base lg:text-xl text-primary-foreground/90 mb-8 lg:mb-10 max-w-2xl mx-auto">
              <span className="font-semibold">Plus de 2 500 foyers</span> ont déjà rejoint l'achat groupé. Inscrivez-vous maintenant pour bénéficier des meilleurs tarifs négociés.
            </p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="secondary"
                size="xl"
                className="group py-5 md:py-6 px-8 md:px-10 text-base md:text-lg"
                asChild
                onClick={() => trackClick({ eventType: 'cta_inscription', source: 'cta_section' })}
              >
                <Link to="/inscription">
                  Rejoindre maintenant
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
