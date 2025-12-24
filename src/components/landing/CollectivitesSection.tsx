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
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background gradient matching hero */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
          >
            <Building2 className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">Collectivités & Partenaires</span>
          </motion.div>

          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Vous souhaitez organiser un{" "}
            <span className="gradient-text">achat groupé</span>{" "}
            dans votre ville ?
          </h2>
          
          <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            Switchly accompagne les mairies, collectivités et partenaires locaux
            dans l'organisation d'achats groupés d'électricité et d'internet
            au bénéfice des habitants, sans engagement et en toute transparence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
            {points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-switchly-md border border-border card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 mx-auto shadow-glow">
                  <point.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="text-sm md:text-base text-foreground font-medium">
                  {point.text}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-full px-4 md:px-0 md:w-auto"
          >
            <Button
              asChild
              variant="hero"
              size="xl"
              className="w-full md:w-auto py-6 md:py-7 px-6 md:px-8 text-sm md:text-lg"
            >
              <Link to="/organiser-achat-groupe">
                Organiser un achat groupé dans ma ville
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
