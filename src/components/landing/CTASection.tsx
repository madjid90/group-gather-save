import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-hero p-8 sm:p-10 md:p-14 lg:p-20 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-5 md:mb-8">
              Rejoignez l'achat groupé Switchly
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 md:mb-10 max-w-2xl mx-auto">
              L'inscription est gratuite et sans engagement. Plus le groupe grandit, plus nous pouvons négocier des prix avantageux.
            </p>
            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="xl"
                className="group w-full max-w-md sm:w-auto py-7 sm:py-5 text-base sm:text-lg mx-4 sm:mx-0"
                asChild
              >
                <Link to="/inscription">
                  Je participe à l'achat groupé
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <p className="text-sm sm:text-base text-primary-foreground/70 mt-6 md:mt-8">
              Aucune publicité, aucune vente de données. Nous vous contactons uniquement pour vous transmettre les offres négociées.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
