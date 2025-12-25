import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Wifi } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative z-10">
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
              Prêt à réduire vos factures ?
            </h2>
            <p className="text-base lg:text-xl text-primary-foreground/90 mb-8 lg:mb-10 max-w-2xl mx-auto">
              Rejoignez plus de 2 500 foyers qui économisent déjà sur leurs factures d'électricité et d'internet grâce à l'achat groupé.
            </p>
            {/* CTA - all screens */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="secondary"
                size="xl"
                className="group py-5 md:py-6 px-8 md:px-10 text-base md:text-lg"
                asChild
              >
                <Link to="/inscription">
                  Rejoindre gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/70 mt-6">
              ✓ Inscription gratuite en 30 secondes • ✓ Sans engagement • ✓ Offre personnalisée
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
