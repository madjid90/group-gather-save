import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export default function GroupementVille() {
  const { ville } = useParams<{ ville: string }>();
  const displayVille = ville
    ? ville.charAt(0).toUpperCase() + ville.slice(1)
    : "Votre ville";

  // Mock data - would come from the database
  const groupementData = {
    membres: 1247,
    economiesGenerees: 156780,
    nouveauxAujourdhui: 34,
    joursRestants: 12,
    fournisseurs: ["EDF", "Engie", "TotalEnergies", "Orange", "Free"],
    objectif: 1500,
  };

  const progression = Math.round(
    (groupementData.membres / groupementData.objectif) * 100
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Groupement local</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Groupement de{" "}
            <span className="gradient-text">{displayVille}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez les habitants de {displayVille} et économisez ensemble sur
            vos factures d'électricité et d'internet.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-card rounded-2xl p-6 border border-border shadow-switchly text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              <AnimatedCounter value={groupementData.membres} />
            </div>
            <p className="text-sm text-muted-foreground">Membres</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-switchly text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-secondary mb-1">
              <AnimatedCounter
                value={groupementData.economiesGenerees}
                suffix="€"
              />
            </div>
            <p className="text-sm text-muted-foreground">Économies générées</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-switchly text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              +<AnimatedCounter value={groupementData.nouveauxAujourdhui} />
            </div>
            <p className="text-sm text-muted-foreground">
              Nouveaux membres aujourd'hui
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-switchly text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              <AnimatedCounter value={groupementData.joursRestants} /> jours
            </div>
            <p className="text-sm text-muted-foreground">
              Date limite négociation
            </p>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-3xl p-8 border border-border shadow-switchly-lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Progression du groupement
              </h2>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {groupementData.membres} / {groupementData.objectif} membres
                  </span>
                  <span className="font-medium text-foreground">
                    {progression}%
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-hero rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progression}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Objectif : {groupementData.objectif} membres pour une remise
                  maximale de 25%
                </p>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Paliers de réduction
                </h3>
                <div className="space-y-3">
                  {[
                    { members: 500, discount: 10, reached: true },
                    { members: 1000, discount: 15, reached: true },
                    { members: 1500, discount: 20, reached: false },
                    { members: 2000, discount: 25, reached: false },
                  ].map((milestone, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        milestone.reached
                          ? "bg-secondary/10 border border-secondary/20"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {milestone.reached ? (
                          <CheckCircle2 className="w-5 h-5 text-secondary" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                        )}
                        <span
                          className={
                            milestone.reached
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {milestone.members} membres
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          milestone.reached
                            ? "text-secondary"
                            : "text-muted-foreground"
                        }`}
                      >
                        -{milestone.discount}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column - CTA and suppliers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            {/* CTA Card */}
            <div className="bg-gradient-hero rounded-3xl p-8 text-center">
              <h3 className="text-xl font-bold text-primary-foreground mb-4">
                Rejoignez le groupement de {displayVille}
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Inscription gratuite en 20 secondes
              </p>
              <Button variant="secondary" size="lg" className="w-full" asChild>
                <Link to="/inscription">
                  Rejoindre le groupement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Suppliers */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-switchly">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Fournisseurs contactés
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupementData.fournisseurs.map((fournisseur, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-muted text-sm text-foreground"
                  >
                    {fournisseur}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
