import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const energyPartners = [
  { name: "TotalEnergies", initials: "TE" },
  { name: "Engie", initials: "EN" },
  { name: "Ohm Énergie", initials: "OE" },
  { name: "Mint Énergie", initials: "ME" },
  { name: "Eni", initials: "ENI" },
  { name: "EDF", initials: "EDF" },
];

const internetPartners = [
  { name: "Bouygues Telecom", initials: "BT" },
  { name: "SFR", initials: "SFR" },
  { name: "Orange", initials: "OR" },
  { name: "Free", initials: "FR" },
];

const allPartners = [...energyPartners, ...internetPartners];

export function PartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nos fournisseurs partenaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nous collaborons uniquement avec des fournisseurs fiables et reconnus pour vous garantir des offres transparentes et avantageuses.
          </p>
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {allPartners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-xl p-6 h-20 flex items-center justify-center transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:bg-card/80">
                <span className="text-lg md:text-xl font-bold text-muted-foreground/60 group-hover:text-primary transition-colors">
                  {partner.initials}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2 opacity-70">
                {partner.name}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline group"
          >
            Découvrez les offres négociées
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
