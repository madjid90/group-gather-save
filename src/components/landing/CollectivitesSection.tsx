import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

export const CollectivitesSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Collectivités</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 lg:mb-6">
            Organisez un achat groupé d'énergie dans votre ville
          </h2>
          
          <p className="text-base lg:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
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
