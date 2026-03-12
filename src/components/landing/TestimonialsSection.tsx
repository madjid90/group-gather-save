import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Julie M.", location: "Lyon (69)", rating: 5, saving: "312€/an", type: "Électricité", text: "Comparaison ultra rapide, j'ai trouvé une offre 23% moins chère en 30 secondes. Changement sans coupure, je recommande.", textMobile: "23% moins cher, tout en 30 secondes.", avatar: "J" },
  { name: "Thomas D.", location: "Bordeaux (33)", rating: 5, saving: "340€/an", type: "Électricité + Gaz", text: "J'ai comparé électricité et gaz en même temps. Résultat : 340€ économisés cette année, zéro prise de tête.", textMobile: "340€/an, zéro prise de tête.", avatar: "T" },
  { name: "Camille P.", location: "Nantes (44)", rating: 5, saving: "276€/an", type: "Électricité", text: "30 secondes de comparaison, offre souscrite en 5 minutes. 276€ de moins sur ma facture annuelle.", textMobile: "276€/an économisés.", avatar: "C" },
  { name: "Marc L.", location: "Lille (59)", rating: 5, saving: "198€/an", type: "Gaz", text: "Mon contrat gaz était bien trop cher. Grâce à Switchly, j'ai trouvé une offre à -18% par rapport au tarif repère.", textMobile: "Gaz : -18% vs tarif repère.", avatar: "M" },
  { name: "Karim B.", location: "Toulouse (31)", rating: 5, saving: "412€/an", type: "Électricité + Gaz", text: "Électricité + gaz combinés : 412€ économisés en un an. Gratuit, simple et efficace.", textMobile: "412€/an, simple et efficace.", avatar: "K" },
];

export function TestimonialsSection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-10"
        >
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-wide mb-2">
            Témoignages
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
            Ils ont économisé avec Switchly
          </h2>
          <p className="text-[13px] leading-relaxed lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Économies réelles réalisées par nos utilisateurs sur leurs factures énergie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={index >= 3 ? "hidden md:block" : ""}
            >
              <div className="bg-card rounded-lg md:rounded-2xl p-3 md:p-5 h-full border border-border shadow-switchly">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                    💰 {testimonial.saving}
                  </span>
                  <span className="text-xs text-muted-foreground">{testimonial.type}</span>
                </div>
                <div className="flex gap-0.5 md:gap-1 mb-1.5 md:mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-4 md:h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-2 md:mb-4 text-xs md:text-sm leading-relaxed">
                  "<span className="hidden md:inline">{testimonial.text}</span>
                  <span className="md:hidden">{testimonial.textMobile}</span>"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-semibold text-xs">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-xs">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden md:block text-center"
        >
          <Button variant="hero" size="lg" asChild>
            <Link to="/comparer">Comparer gratuitement</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
