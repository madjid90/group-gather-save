import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Flame } from "lucide-react";
import { trackClick } from "@/hooks/useClickTracking";

export function CTASection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-card">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-hero p-6 md:p-10 lg:p-12 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-medium">Électricité</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Flame className="w-3 h-3" />
                <span className="text-xs font-medium">Gaz</span>
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-primary-foreground mb-3 lg:mb-4">
              Payez moins cher votre énergie dès maintenant
            </h2>
            <p className="text-[14px] leading-relaxed lg:text-xl text-primary-foreground/90 mb-6 lg:mb-8 max-w-2xl mx-auto">
              <span className="font-semibold">Plus de 2 500 foyers</span> ont déjà économisé grâce à Switchly. Comparez en 30 secondes.
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
                <Link to="/comparer">
                  Comparer gratuitement →
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
