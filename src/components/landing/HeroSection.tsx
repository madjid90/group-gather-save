import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Zap } from "lucide-react";

export const HeroSection = memo(function HeroSection() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"cp" | "type">("cp");
  const [cp, setCp] = useState("");

  const go = (type: string) => {
    navigate(`/comparer?cp=${cp}&type=${type}`);
  };

  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-20">

      <div className="container mx-auto px-4 max-w-2xl relative z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
        >
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          Comparateur 100% gratuit — 2 547 foyers accompagnés
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight"
        >
          Économisez jusqu'à{" "}
          <span className="text-secondary font-extrabold">300€/an</span>
          <br className="hidden sm:block" /> sur votre énergie
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
          className="text-base sm:text-lg text-muted-foreground mb-8"
        >
          Comparez électricité et gaz en 30 secondes.
          <br className="hidden sm:block" /> Sans engagement. 100% gratuit.
        </motion.p>

        {/* Search box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-card border border-border rounded-2xl p-4 shadow-md mb-6"
        >
          {step === "cp" ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={cp}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setCp(v);
                  if (v.length === 5) setStep("type");
                }}
                placeholder="Votre code postal — ex : 44000"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                inputMode="numeric"
                maxLength={5}
                autoFocus
              />
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold h-12 px-6 whitespace-nowrap"
                onClick={() => { if (cp.length === 5) setStep("type"); }}
                disabled={cp.length !== 5}
              >
                Voir les offres →
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-center text-foreground">Que souhaitez-vous comparer ?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "⚡ Électricité", v: "electricite" },
                  { l: "🔥 Gaz", v: "gaz" },
                ].map(o => (
                  <button
                    key={o.v}
                    onClick={() => go(o.v)}
                    className="py-3 rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all text-sm font-semibold text-foreground"
                  >
                    {o.l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => go("les_deux")}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Comparer électricité + gaz
              </button>
              <button
                onClick={() => setStep("cp")}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Modifier le code postal ({cp})
              </button>
            </div>
          )}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
        >
          {[
            { icon: CheckCircle, label: "Sans coupure" },
            { icon: Zap, label: "Sans engagement" },
            { icon: Shield, label: "Données sécurisées" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-secondary" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
