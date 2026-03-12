import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Julie M.",
    location: "Lyon (69)",
    saving: "312€/an",
    type: "Électricité",
    text: "Comparaison ultra rapide, j'ai trouvé une offre 23% moins chère en 30 secondes. Changement sans coupure.",
    avatar: "J",
  },
  {
    name: "Thomas D.",
    location: "Bordeaux (33)",
    saving: "340€/an",
    type: "Élec + Gaz",
    text: "J'ai comparé électricité et gaz en même temps. Résultat : 340€ économisés cette année, zéro prise de tête.",
    avatar: "T",
  },
  {
    name: "Camille P.",
    location: "Nantes (44)",
    saving: "276€/an",
    type: "Électricité",
    text: "30 secondes de comparaison, offre souscrite en 5 minutes. 276€ de moins sur ma facture annuelle.",
    avatar: "C",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-widest mb-3">
            Témoignages
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Ils ont économisé avec Switchly
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Économies réelles réalisées par nos utilisateurs sur leurs factures énergie.
          </p>
        </motion.div>

        {/* Grid — 1 col mobile, 3 cols tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
                {/* Header: saving + type */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold bg-secondary/15 text-secondary px-2.5 py-1 rounded-full">
                    💰 {t.saving}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.type}</span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-foreground leading-relaxed flex-1 mb-4">"{t.text}"</p>

                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
