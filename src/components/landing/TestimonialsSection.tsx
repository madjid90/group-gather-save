import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, ArrowRight, Quote } from "lucide-react";

const testimonials = [
  { name: "Julie M.", location: "Lyon (69)", rating: 5, saving: "312€/an", type: "Électricité", text: "Comparaison ultra rapide, j'ai trouvé une offre 23% moins chère en 30 secondes. Changement sans coupure, je recommande.", textMobile: "23% moins cher, tout en 30 secondes.", avatar: "J", gradient: "from-primary to-primary/70" },
  { name: "Thomas D.", location: "Bordeaux (33)", rating: 5, saving: "340€/an", type: "Élec + Gaz", text: "J'ai comparé électricité et gaz en même temps. Résultat : 340€ économisés cette année, zéro prise de tête.", textMobile: "340€/an, zéro prise de tête.", avatar: "T", gradient: "from-secondary to-secondary/70" },
  { name: "Camille P.", location: "Nantes (44)", rating: 5, saving: "276€/an", type: "Électricité", text: "30 secondes de comparaison, offre souscrite en 5 minutes. 276€ de moins sur ma facture annuelle.", textMobile: "276€/an économisés.", avatar: "C", gradient: "from-primary to-secondary" },
  { name: "Marc L.", location: "Lille (59)", rating: 5, saving: "198€/an", type: "Gaz", text: "Mon contrat gaz était bien trop cher. Grâce à Switchly, j'ai trouvé une offre à -18% par rapport au tarif repère.", textMobile: "Gaz : -18% vs tarif repère.", avatar: "M", gradient: "from-secondary to-primary" },
  { name: "Karim B.", location: "Toulouse (31)", rating: 5, saving: "412€/an", type: "Élec + Gaz", text: "Électricité + gaz combinés : 412€ économisés en un an. Gratuit, simple et efficace.", textMobile: "412€/an, simple et efficace.", avatar: "K", gradient: "from-primary to-primary/70" },
];

export function TestimonialsSection() {
  return (
    <section className="py-section-mobile lg:py-section-desktop relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Star className="w-3 h-3 fill-primary" />
            Témoignages
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Ils ont économisé avec <span className="gradient-text">Switchly</span>
          </h2>
          <p className="text-sm lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Économies réelles réalisées par nos utilisateurs sur leurs factures énergie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`${index >= 3 ? "hidden md:block" : ""} group`}
            >
              <div className="bg-card rounded-2xl p-4 md:p-5 h-full border border-border/60 card-hover relative overflow-hidden">
                <Quote className="absolute top-3 right-3 w-8 h-8 text-muted/20" />
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">
                    💰 {testimonial.saving}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">{testimonial.type}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-3 text-xs md:text-sm leading-relaxed relative z-10">
                  "<span className="hidden md:inline">{testimonial.text}</span>
                  <span className="md:hidden">{testimonial.textMobile}</span>"
                </p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs">{testimonial.name}</p>
                    <p className="text-[10px] text-muted-foreground">{testimonial.location}</p>
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
            <Link to="/comparer">Comparer gratuitement <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
