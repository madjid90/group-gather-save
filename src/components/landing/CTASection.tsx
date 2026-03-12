import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackClick } from "@/hooks/useClickTracking";

export function CTASection() {
  return (
    <section className="py-section-mobile lg:py-section-desktop">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-14 lg:p-16 text-center"
        >
          {/* Floating orbs */}
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl translate-x-1/3 translate-y-1/3" aria-hidden="true" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} aria-hidden="true" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/90 text-xs font-semibold mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Plus de 2 500 foyers accompagnés
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-primary-foreground mb-4 lg:mb-5 leading-tight tracking-tight">
              Payez moins cher votre<br className="hidden sm:block" /> énergie dès maintenant
            </h2>
            <p className="text-sm lg:text-xl text-primary-foreground/80 mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed">
              Comparez en 30 secondes. Gratuit, sans engagement.
            </p>
            
            <Button
              variant="glass"
              size="xl"
              className="px-10 text-lg group bg-white/95 text-foreground hover:bg-white shadow-xl"
              asChild
              onClick={() => trackClick({ eventType: 'cta_inscription', source: 'cta_section' })}
            >
              <Link to="/comparer">
                Comparer gratuitement
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
