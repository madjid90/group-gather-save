import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-10 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-hero p-8 lg:p-16 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground mb-4 lg:mb-6">
              <span className="text-sm font-medium">⏰ Négociation en cours — Places limitées</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-4 lg:mb-8">
              Obtenez votre offre personnalisée en 48h
            </h2>
            <p className="text-sm lg:text-xl text-primary-foreground/80 mb-8 lg:mb-10 max-w-2xl mx-auto">
              <span className="hidden lg:inline">Rejoignez les 2 547 foyers déjà inscrits et économisez en moyenne 312€/an sur vos factures. Inscription gratuite en 30 secondes.</span>
              <span className="lg:hidden">2 547 foyers inscrits. 312€/an économisés en moyenne.</span>
            </p>
            {/* CTA - hidden on mobile */}
            <div className="hidden lg:flex justify-center">
              <Button
                variant="secondary"
                size="xl"
                className="group py-6 px-10 text-lg"
                asChild
              >
                <Link to="/inscription">
                  Obtenir mon offre personnalisée — Gratuit
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <p className="text-xs lg:text-base text-primary-foreground/70 mt-6 lg:mt-8">
              <span className="hidden lg:inline">✓ 100% gratuit • ✓ Sans engagement • ✓ Données sécurisées • ✓ Résultat en 48h</span>
              <span className="lg:hidden">Gratuit • Sans engagement • Résultat en 48h</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
