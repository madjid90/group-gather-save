import { Button } from "@/components/ui/button";
import { Zap, Wifi, ExternalLink } from "lucide-react";

const offres = [
  { id: 1, fournisseur: "EDF", type: "Électricité", economie: 180, tarif: "0.1823€/kWh" },
  { id: 2, fournisseur: "Free", type: "Internet", economie: 144, tarif: "29.99€/mois" },
  { id: 3, fournisseur: "TotalEnergies", type: "Combo", economie: 320, tarif: "Pack complet" },
];

export default function MesOffres() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mes Offres</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offres.map((offre) => (
          <div key={offre.id} className="bg-card rounded-2xl p-6 border">
            <div className="flex items-center gap-3 mb-4">
              {offre.type === "Internet" ? <Wifi className="w-6 h-6 text-primary" /> : <Zap className="w-6 h-6 text-primary" />}
              <span className="font-semibold">{offre.fournisseur}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{offre.type}</p>
            <p className="text-2xl font-bold text-secondary mb-4">-{offre.economie}€/an</p>
            <p className="text-sm text-muted-foreground mb-4">{offre.tarif}</p>
            <Button variant="hero" className="w-full">Souscrire <ExternalLink className="w-4 h-4 ml-2" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
