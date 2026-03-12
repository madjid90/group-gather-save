import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedCounter, useAnimatedSocialProof } from "@/components/ui/AnimatedCounter";
import { ArrowRight, Shield, Zap, CheckCircle } from "lucide-react";

export const HeroSection = memo(function HeroSection() {
  const { count } = useAnimatedSocialProof(2547, 12000);
  const [step, setStep] = useState<'cp' | 'type'>('cp');
  const [cp, setCp] = useState('');

  const handleCompare = (type: string) => {
    window.location.href = `/comparer?cp=${cp}&type=${type}`;
  };

  return (
    <section className="relative min-h-[90svh] flex items-center overflow-hidden py-8 lg:py-0">
      {/* Mesh background with orbs */}
      <div className="absolute inset-0 bg-mesh" aria-hidden="true" />
      <div className="orb orb-blue w-[400px] h-[400px] -top-20 -left-20 animate-float-slow" aria-hidden="true" />
      <div className="orb orb-green w-[300px] h-[300px] -bottom-10 -right-10 animate-float" aria-hidden="true" />
      <div className="orb orb-cyan w-[200px] h-[200px] top-1/3 right-1/4 animate-float-slow" style={{ animationDelay: '-3s' }} aria-hidden="true" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} aria-hidden="true" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-foreground">
              Comparateur 100% gratuit — <AnimatedCounter target={2547} externalValue={count} duration={2} showLiveIndicator={false} />&nbsp;foyers accompagnés
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground mb-5 leading-[1.1] tracking-tight"
          >
            Économisez jusqu'à{' '}
            <span className="gradient-text">300€/an</span>
            <br className="hidden sm:block" />
            {' '}sur votre énergie
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Comparez les offres électricité et gaz en <strong className="text-foreground">30 secondes</strong>. Sans engagement. 100% gratuit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-2xl p-5 sm:p-6 max-w-xl mx-auto mb-8"
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
                  className="flex-1 bg-background/80 border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                  Voir les offres <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-center">Que souhaitez-vous comparer ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: '⚡ Électricité', v: 'electricite' },
                    { l: '🔥 Gaz', v: 'gaz' },
                  ].map(o => (
                    <button
                      key={o.v}
                      onClick={() => handleCompare(o.v)}
                      className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-border bg-background/60 hover:border-primary hover:bg-primary/5 hover:shadow-sm transition-all text-sm font-medium"
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => handleCompare('les_deux')}
                  className="w-full"
                >
                  Comparer électricité + gaz <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <button
                  onClick={() => setStep('cp')}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Modifier le code postal ({cp})
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            {[
              { icon: <Zap className="w-3.5 h-3.5 text-primary" />, label: "Sans coupure" },
              { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: "100% gratuit" },
              { icon: <CheckCircle className="w-3.5 h-3.5 text-secondary" />, label: "Sans engagement" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
});
