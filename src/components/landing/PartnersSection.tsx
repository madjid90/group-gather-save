import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Wifi } from "lucide-react";

// Import downloaded logos
import totalenergiesLogo from "@/assets/logos/totalenergies.svg";
import engieLogo from "@/assets/logos/engie.svg";
import edfLogo from "@/assets/logos/edf.svg";
import eniLogo from "@/assets/logos/eni.svg";
import bouyguesLogo from "@/assets/logos/bouygues.svg";
import sfrLogo from "@/assets/logos/sfr.svg";
import orangeLogo from "@/assets/logos/orange.svg";
import freeLogo from "@/assets/logos/free-new.png";

interface Partner {
  name: string;
  type: "energy" | "internet";
  logo: string;
}

const partners: Partner[] = [
  { name: "TotalEnergies", type: "energy", logo: totalenergiesLogo },
  { name: "Engie", type: "energy", logo: engieLogo },
  { name: "Eni", type: "energy", logo: eniLogo },
  { name: "EDF", type: "energy", logo: edfLogo },
  { name: "Bouygues Telecom", type: "internet", logo: bouyguesLogo },
  { name: "SFR", type: "internet", logo: sfrLogo },
  { name: "Orange", type: "internet", logo: orangeLogo },
  { name: "Free", type: "internet", logo: freeLogo },
];

function PartnerLogo({ partner }: { partner: Partner }) {
  const isEnergy = partner.type === "energy";
  
  return (
    <div className="group flex-shrink-0 w-36 md:w-44">
      <div className="relative bg-card border border-border rounded-2xl p-4 md:p-6 h-24 md:h-28 flex flex-col items-center justify-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
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
        
        {/* Logo */}
        <img 
          src={partner.logo} 
          alt={`Logo ${partner.name}`}
          className="h-10 md:h-12 w-auto max-w-[100px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        />
      </div>
    </div>
  );
}

export function PartnersSection() {
  // Double the partners array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

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
            Nous collaborons uniquement avec des fournisseurs fiables et reconnus pour vous garantir des offres transparentes et avantageuses.
          </p>
        </motion.div>

        {/* Infinite Scroll Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{
                x: [0, -50 * partners.length * 3],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {duplicatedPartners.map((partner, index) => (
                <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
              ))}
              {duplicatedPartners.map((partner, index) => (
                <PartnerLogo key={`${partner.name}-${index}-2`} partner={partner} />
              ))}
            </motion.div>
          </div>
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
