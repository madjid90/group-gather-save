import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Users, TrendingUp, Clock } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function LocalGroupSection() {
  // Mock data - would come from the database
  const cityData = {
    ville: "Paris",
    membres: 1247,
    nouveauxAujourdhui: 34,
    economiesGenerees: 156780,
    joursRestants: 12,
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Groupement local</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Votre groupement local : <span className="gradient-text">{cityData.ville}</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-switchly-xl border border-border">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {/* Members */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  <AnimatedCounter value={cityData.membres} />
                </div>
                <p className="text-sm text-muted-foreground">Membres</p>
              </div>

              {/* New today */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-secondary">
                  +<AnimatedCounter value={cityData.nouveauxAujourdhui} />
                </div>
                <p className="text-sm text-muted-foreground">Nouveaux aujourd'hui</p>
              </div>

              {/* Savings */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  <AnimatedCounter value={cityData.economiesGenerees} suffix="€" />
                </div>
                <p className="text-sm text-muted-foreground">Économies générées</p>
              </div>

              {/* Countdown */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter value={cityData.joursRestants} /> jours
                </div>
                <p className="text-sm text-muted-foreground">Avant négociation</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progression du groupement</span>
                <span className="font-medium text-foreground">{Math.round((cityData.membres / 1500) * 100)}%</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-hero rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(cityData.membres / 1500) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Objectif : 1 500 membres pour la remise maximale de 25%
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button variant="hero" size="lg" asChild>
                <Link to={`/groupement/${cityData.ville.toLowerCase()}`}>
                  Rejoindre le groupement de {cityData.ville}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
