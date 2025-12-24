import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-card">
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
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-primary-foreground mb-4 lg:mb-8">
              Rejoindre l'achat groupé Switchly
            </h2>
            <p className="text-sm lg:text-xl text-primary-foreground/80 mb-8 lg:mb-10 max-w-2xl mx-auto">
              Inscription gratuite en 30 secondes. Offre personnalisée. Sans engagement.
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
                  Rejoindre l'achat groupé gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <p className="text-xs lg:text-base text-primary-foreground/70 mt-6 lg:mt-8">
              Gratuit • Sans engagement
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
