import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-center"
        >
          <div className="relative z-10">
            <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-4">
              Économisez dès maintenant
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4 leading-tight">
              Payez moins cher votre énergie
            </h2>
            <p className="text-base text-primary-foreground/85 mb-8 max-w-md mx-auto">
              Plus de 2 500 foyers ont déjà économisé grâce à Switchly.
              <br />Comparez en 30 secondes — gratuit, sans engagement.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold h-12 px-8 text-base shadow-lg"
              asChild
            >
              <Link to="/comparer">
                Comparer gratuitement
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
