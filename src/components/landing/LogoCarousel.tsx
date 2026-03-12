import { memo } from "react";
import { motion } from "framer-motion";

import edfLogo from "@/assets/logos/edf.svg";
import engieLogo from "@/assets/logos/engie.svg";
import totalLogo from "@/assets/logos/totalenergies.svg";
import eniLogo from "@/assets/logos/eni.svg";

const logos = [
  { src: edfLogo, alt: "EDF" },
  { src: engieLogo, alt: "Engie" },
  { src: totalLogo, alt: "TotalEnergies" },
  { src: eniLogo, alt: "ENI" },
];

// Double the array for seamless infinite scroll
const doubledLogos = [...logos, ...logos, ...logos];

export const LogoCarousel = memo(function LogoCarousel() {
  return (
    <section className="py-8 md:py-10 bg-background overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-widest mb-6">
          Offres comparées parmi les fournisseurs
        </p>
      </div>

      <div className="relative w-full">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-12"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {doubledLogos.map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-10 w-28 opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 w-auto max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
