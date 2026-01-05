import { motion } from "framer-motion";

// Import downloaded logos
import totalenergiesLogo from "@/assets/logos/totalenergies.svg";
import engieLogo from "@/assets/logos/engie.svg";
import edfLogo from "@/assets/logos/edf.svg";
import eniLogo from "@/assets/logos/eni.svg";
import bouyguesLogo from "@/assets/logos/bouygues-new.svg";
import sfrLogo from "@/assets/logos/sfr.svg";
import orangeLogo from "@/assets/logos/orange.svg";
import freeLogo from "@/assets/logos/free-new.png";

interface Partner {
  name: string;
  logo: string;
  className?: string;
}

const partners: Partner[] = [
  { name: "TotalEnergies", logo: totalenergiesLogo },
  { name: "Engie", logo: engieLogo },
  { name: "Eni", logo: eniLogo },
  { name: "EDF", logo: edfLogo },
  { name: "Bouygues Telecom", logo: bouyguesLogo, className: "h-12 md:h-20 max-w-[100px] md:max-w-[130px]" },
  { name: "SFR", logo: sfrLogo },
  { name: "Orange", logo: orangeLogo },
  { name: "Free", logo: freeLogo },
];

function PartnerLogo({ partner }: { partner: Partner }) {
  const defaultClass = "h-8 md:h-12 w-auto max-w-[80px] md:max-w-[100px] object-contain grayscale opacity-70";
  const logoClass = partner.className || defaultClass;
  
  return (
    <div className="flex-shrink-0 w-28 md:w-44">
      <div className="bg-card border border-border rounded-xl md:rounded-2xl p-3 md:p-6 h-20 md:h-28 flex items-center justify-center">
        <img 
          src={partner.logo} 
          alt={`Logo ${partner.name}`}
          loading="lazy"
          decoding="async"
          width={100}
          height={48}
          className={`${logoClass} ${!partner.className ? '' : 'w-auto object-contain grayscale opacity-70'}`}
        />
      </div>
    </div>
  );
}

export function PartnersSection() {
  // Double the partners array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-10"
        >
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-wide mb-2">
            Nos partenaires
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
            Fournisseurs de confiance
          </h2>
          <p className="text-[13px] leading-relaxed lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Nous négocions avec des fournisseurs reconnus pour vous garantir les meilleurs tarifs.
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
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-3 md:gap-4"
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
      </div>
    </section>
  );
}
