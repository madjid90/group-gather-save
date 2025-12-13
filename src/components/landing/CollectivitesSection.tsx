import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export const CollectivitesSection = () => {
  const points = [
    {
      icon: Users,
      text: "Campagne locale clé en main, pilotée par Switchly"
    },
    {
      icon: Shield,
      text: "Données anonymisées, aucun engagement pour les habitants"
    },
    {
      icon: Building2,
      text: "Coordination avec fournisseurs et courtiers partenaires"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6">
            Vous souhaitez organiser un achat groupé dans votre ville ?
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Switchly accompagne les mairies, collectivités et partenaires locaux
            dans l'organisation d'achats groupés d'électricité et d'internet
            au bénéfice des habitants, sans engagement et en toute transparence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground">
                  {point.text}
                </p>
              </motion.div>
            ))}
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Link to="/organiser-achat-groupe">
              Organiser un achat groupé dans ma ville
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
