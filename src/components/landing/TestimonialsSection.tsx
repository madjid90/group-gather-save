import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Nadia",
    rating: 5,
    text: "Inscription simple, offre plus avantageuse que mon ancien contrat.",
    avatar: "N",
  },
  {
    name: "Karim",
    rating: 5,
    text: "J'ai économisé sans rien faire. Le concept est génial.",
    avatar: "K",
  },
  {
    name: "Julie",
    rating: 5,
    text: "Service clair, gratuit, et vraiment utile en période de hausse des prix.",
    textMobile: "Service clair, gratuit et utile.",
    avatar: "J",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-10 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
            Ils ont déjà économisé
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            <span className="hidden md:inline">Des milliers de français nous font confiance</span>
            <span className="md:hidden">Rejoignez-les</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 h-full border border-border shadow-switchly">
                {/* Stars - smaller on mobile */}
                <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Quote - smaller on mobile */}
                <p className="text-foreground mb-4 md:mb-6 text-sm md:text-lg">
                  "<span className="hidden md:inline">{testimonial.text}</span>
                  <span className="md:hidden">{testimonial.textMobile || testimonial.text}</span>"
                </p>

                {/* Author - smaller on mobile */}
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm md:text-base">
                      {testimonial.name}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
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
