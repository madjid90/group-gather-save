import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, TrendingUp, Wallet, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const steps = [
    { label: "Inscrit", completed: true },
    { label: "Négociation", completed: false, current: true },
    { label: "Offre disponible", completed: false },
    { label: "Souscription", completed: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bonjour, Jean 👋</h1>
        <p className="text-muted-foreground">Bienvenue dans le groupement de Paris</p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-2xl p-6 border">
        <h2 className="font-semibold mb-6">Votre progression</h2>
        <StepIndicator steps={steps} />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-6 border text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold"><AnimatedCounter value={1247} /></div>
          <p className="text-sm text-muted-foreground">Membres</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border text-center">
          <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold text-secondary">+<AnimatedCounter value={34} /></div>
          <p className="text-sm text-muted-foreground">Nouveaux aujourd'hui</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border text-center">
          <span className="text-2xl">💰</span>
          <div className="text-2xl font-bold"><AnimatedCounter value={156780} suffix="€" /></div>
          <p className="text-sm text-muted-foreground">Économies totales</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border text-center">
          <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary"><AnimatedCounter value={320} suffix="€" /></div>
          <p className="text-sm text-muted-foreground">Votre économie estimée</p>
        </div>
      </div>

      <Button variant="hero" size="lg" asChild>
        <Link to="/dashboard/offres">Voir mes offres <ArrowRight className="w-4 h-4 ml-2" /></Link>
      </Button>
    </div>
  );
}
