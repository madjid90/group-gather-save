import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Julie",
    rating: 5,
    text: "Service clair, gratuit et utile. J'ai recommandé Switchly à ma famille.",
    textMobile: "Service clair, gratuit et utile.",
    avatar: "J",
  },
  {
    name: "Thomas",
    rating: 5,
    text: "J'ai réduit ma facture d'électricité sans changer mes habitudes. Parfait.",
    textMobile: "Facture réduite sans effort.",
    avatar: "T",
  },
  {
    name: "Camille",
    rating: 5,
    text: "Processus rapide, transparent et sans engagement : exactement ce qu'il me fallait.",
    textMobile: "Rapide, transparent, sans engagement.",
    avatar: "C",
  },
  {
    name: "Nadia",
    rating: 5,
    text: "Inscription simple, offre plus avantageuse que mon ancien contrat.",
    avatar: "N",
  },
  {
    name: "Karim",
    rating: 5,
    text: "J'ai économisé sans rien faire. Le concept est vraiment malin.",
    textMobile: "J'ai économisé sans rien faire.",
    avatar: "K",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-10 lg:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4">
            Ils ont déjà économisé
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            <span className="hidden lg:inline">Des milliers de foyers ont déjà réduit leurs factures d'électricité et d'internet grâce à l'achat groupé Switchly.</span>
            <span className="lg:hidden">Avis de participants</span>
          </p>
        </motion.div>

        {/* Desktop: Show all 5, Mobile: Show first 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={index >= 3 ? "hidden md:block" : ""}
            >
              <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-5 h-full border border-border shadow-switchly">
                {/* Stars - smaller on mobile */}
                <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-4 md:h-4 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Quote - smaller on mobile */}
                <p className="text-foreground mb-3 md:mb-4 text-sm md:text-sm leading-relaxed">
                  "<span className="hidden md:inline">{testimonial.text}</span>
                  <span className="md:hidden">{testimonial.textMobile || testimonial.text}</span>"
                </p>

                {/* Author - smaller on mobile */}
                <div className="flex items-center gap-2 md:gap-2">
                  <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Membre Switchly
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden md:block text-center"
        >
          <Button variant="hero" size="lg" asChild>
            <Link to="/inscription">Rejoindre gratuitement l'achat groupé</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
