import { motion } from "framer-motion";
import { TrendingDown, Scale, MessageSquare, Shield } from "lucide-react";

const advantages = [
  {
    icon: MessageSquare,
    title: "100% en ligne",
    description: "Tout se fait en ligne, sans démarchage téléphonique. Simple, rapide, sans contrainte.",
    color: "primary",
  },
  {
    icon: TrendingDown,
    title: "300€ économisés/an",
    description: "Économie moyenne constatée sur les factures d'électricité et gaz en changeant de fournisseur.",
    color: "secondary",
  },
  {
    icon: Shield,
    title: "Fournisseurs reconnus",
    description: "EDF, Engie, TotalEnergies, OHM Énergie… Uniquement des acteurs établis et fiables.",
    color: "primary",
  },
  {
    icon: Scale,
    title: "0€ si vous refusez",
    description: "Vous restez libre. Si l'offre ne vous convient pas, vous ne payez absolument rien.",
    color: "secondary",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-16 md:py-20 bg-card">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-secondary font-semibold text-xs uppercase tracking-widest mb-3">
            Nos avantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Pourquoi choisir Switchly ?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Des économies réelles, sans risque et sans engagement.
          </p>
        </motion.div>

        {/* Grid 2 cols mobile → 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {advantages.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="bg-background border border-border rounded-2xl p-5 h-full text-center hover:shadow-md transition-shadow">
                <div
                  className={`w-11 h-11 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    a.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                  }`}
                >
                  <a.icon
                    className={`w-5 h-5 ${a.color === "primary" ? "text-primary" : "text-secondary"}`}
                  />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-2">{a.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
