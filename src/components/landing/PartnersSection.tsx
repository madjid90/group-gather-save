import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Wifi } from "lucide-react";

interface Partner {
  name: string;
  type: "energy" | "internet";
}

const partners: Partner[] = [
  { name: "TotalEnergies", type: "energy" },
  { name: "Engie", type: "energy" },
  { name: "Sowee", type: "energy" },
  { name: "Ohm Énergie", type: "energy" },
  { name: "Mint Énergie", type: "energy" },
  { name: "Eni", type: "energy" },
  { name: "EDF", type: "energy" },
  { name: "Bouygues Telecom", type: "internet" },
  { name: "SFR", type: "internet" },
  { name: "Orange", type: "internet" },
  { name: "Free", type: "internet" },
];

function PartnerLogo({ partner, index }: { partner: Partner; index: number }) {
  const isEnergy = partner.type === "energy";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div className="relative bg-card border border-border rounded-2xl p-4 md:p-6 h-24 md:h-28 flex flex-col items-center justify-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        {/* Icon indicator */}
        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
          isEnergy ? "bg-primary/10" : "bg-secondary/10"
        }`}>
          {isEnergy ? (
            <Zap className="w-3 h-3 text-primary" />
          ) : (
            <Wifi className="w-3 h-3 text-secondary" />
          )}
        </div>
        
        {/* Logo placeholder - styled as brand name */}
        <div className="flex items-center justify-center">
          <span className={`text-sm md:text-base font-bold tracking-tight text-center leading-tight ${
            isEnergy 
              ? "text-primary/70 group-hover:text-primary" 
              : "text-secondary/70 group-hover:text-secondary"
          } transition-colors`}>
            {partner.name}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function PartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30 overflow-hidden">
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
            Nous collaborons avec des fournisseurs fiables et reconnus pour vous garantir des offres transparentes et avantageuses.
          </p>
        </motion.div>

        {/* Partners Grid - 2 cols mobile, 3 cols tablet, 5 cols desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto"
        >
          {partners.map((partner, index) => (
            <PartnerLogo key={partner.name} partner={partner} index={index} />
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center gap-6 mt-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-primary" />
            </div>
            <span>Énergie</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Wifi className="w-2.5 h-2.5 text-secondary" />
            </div>
            <span>Internet</span>
          </div>
        </motion.div>

        {/* CTA Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
