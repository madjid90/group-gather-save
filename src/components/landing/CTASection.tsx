import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-10 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-hero p-6 sm:p-10 md:p-14 lg:p-20 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3 md:mb-8">
              Rejoignez l'achat groupé Switchly
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-primary-foreground/80 mb-6 md:mb-10 max-w-2xl mx-auto">
              <span className="hidden md:inline">L'inscription est gratuite et sans engagement. Plus le groupe grandit, plus nous pouvons négocier des prix avantageux.</span>
              <span className="md:hidden">Gratuit et sans engagement.</span>
            </p>
            {/* CTA - hidden on mobile */}
            <div className="hidden md:flex justify-center">
              <Button
                variant="secondary"
                size="xl"
                className="group w-[calc(100%-2rem)] max-w-md sm:w-auto py-7 sm:py-5 text-base sm:text-lg"
                asChild
              >
                <Link to="/inscription">
                  Je rejoins l'achat groupé gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-primary-foreground/70 mt-4 md:mt-8">
              <span className="hidden md:inline">Aucune publicité, aucune vente de données. Switchly n'est pas un fournisseur d'énergie.</span>
              <span className="md:hidden">Zéro publicité, zéro vente de données.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
