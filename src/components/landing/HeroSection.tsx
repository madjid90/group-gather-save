import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedCounter, useAnimatedSocialProof } from "@/components/ui/AnimatedCounter";

export const HeroSection = memo(function HeroSection() {
  const { count } = useAnimatedSocialProof(2547, 12000);
  const [step, setStep] = useState<'cp' | 'type'>('cp');
  const [cp, setCp] = useState('');

  const handleCompare = (type: string) => {
    window.location.href = `/comparer?cp=${cp}&type=${type}`;
  };

  return (
    <section className="relative min-h-[85svh] flex items-center overflow-hidden py-8 lg:py-0">
      <div className="absolute inset-0 bg-gradient-subtle" aria-hidden="true" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Comparateur 100% gratuit — <AnimatedCounter target={2547} externalValue={count} duration={2} showLiveIndicator={false} /> foyers accompagnés
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-4 leading-tight"
          >
            Économisez jusqu'à <span className="gradient-text">400€/an</span> sur vos factures
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Comparez les offres électricité, gaz et internet en 30 secondes. Sans engagement. 100% gratuit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-lg max-w-xl mx-auto mb-6"
          >
            {step === 'cp' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={cp}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setCp(v);
                    if (v.length === 5) setStep('type');
                  }}
                  placeholder="Votre code postal (ex: 44000)"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  inputMode="numeric"
                  maxLength={5}
                  autoFocus
                />
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => { if (cp.length === 5) setStep('type'); }}
                  disabled={cp.length !== 5}
                  className="whitespace-nowrap"
                >
                  Voir les offres →
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-center">Que souhaitez-vous comparer ?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: '⚡ Électricité', v: 'electricite' },
                    { l: '🔥 Gaz', v: 'gaz' },
                    { l: '📶 Internet', v: 'internet' },
                  ].map(o => (
                    <button
                      key={o.v}
                      onClick={() => handleCompare(o.v)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium"
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleCompare('tous')}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Comparer tout (électricité + gaz + internet)
                </button>
                <button
                  onClick={() => setStep('cp')}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Modifier le code postal ({cp})
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground"
          >
            <span>✓ Sans coupure</span><span className="text-border">|</span>
            <span>✓ 100% gratuit</span><span className="text-border">|</span>
            <span>✓ Sans engagement</span><span className="text-border">|</span>
            <span>✓ Résultat immédiat</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-border"
          >
            <p className="text-xs text-muted-foreground">
              Vous préférez des prix négociés collectivement ?{' '}
              <Link to="/inscription" className="text-primary hover:underline font-medium">
                Rejoindre l'achat groupé →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
