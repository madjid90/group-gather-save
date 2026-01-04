import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

export const CollectivitesSection = () => {
  return (
    <section className="py-8 sm:py-10 lg:py-16 bg-muted/30 min-h-[60svh] lg:min-h-auto flex items-center">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Collectivités</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
            Organisez un achat groupé d'énergie dans votre ville
          </h2>
          
          <p className="text-sm lg:text-lg text-muted-foreground mb-5 max-w-2xl mx-auto">
            Switchly accompagne les mairies et collectivités dans l'organisation d'achats groupés d'électricité, gaz et internet pour leurs habitants.
          </p>

          <Button
            asChild
            variant="hero"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link to="/organiser-achat-groupe">
              En savoir plus
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
