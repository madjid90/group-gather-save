import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-hero p-8 sm:p-10 md:p-12 lg:p-16 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 md:mb-6">
              Rejoignez l'achat groupé en quelques clics
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-6 md:mb-8 max-w-2xl mx-auto">
              L'inscription est gratuite et sans engagement. Plus nous sommes nombreux, plus la négociation est efficace.
            </p>
            <div className="flex justify-center px-4">
              <Button
                variant="secondary"
                size="xl"
                className="group w-full sm:w-auto py-6 sm:py-4 text-base"
                asChild
              >
                <Link to="/inscription">
                  Je participe à l'achat groupé
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/70 mt-4 md:mt-6">
              Vos informations ne sont utilisées que pour vous communiquer les offres négociées. Aucun spam.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
