import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  Ruler, 
  Users, 
  Flame, 
  Zap, 
  Globe, 
  Euro, 
  Car,
  Loader2
} from "lucide-react";

interface HousingProfile {
  type_logement: string | null;
  surface: number | null;
  nombre_occupants: number | null;
  mode_chauffage: string | null;
  fournisseur_electricite: string | null;
  montant_facture: number | null;
  type_connexion: string | null;
  fournisseur_internet: string | null;
  prix_mensuel_internet: number | null;
  equipements_energivores: string[] | null;
  recharge_vehicule_electrique: boolean | null;
}

const LABELS: Record<string, string> = {
  appartement: "Appartement",
  maison: "Maison",
  studio: "Studio",
  electrique: "Électrique",
  gaz: "Gaz",
  fioul: "Fioul",
  pompe_chaleur: "Pompe à chaleur",
  bois: "Bois",
  edf: "EDF",
  engie: "Engie",
  totalenergies: "TotalEnergies",
  eni: "Eni",
  fibre: "Fibre optique",
  adsl: "ADSL",
  "4g_box": "Box 4G/5G",
  orange: "Orange",
  sfr: "SFR",
  free: "Free",
  bouygues: "Bouygues Telecom",
  climatisation: "Climatisation",
  piscine: "Piscine",
  seche_linge: "Sèche-linge",
  congelateur: "Congélateur",
  lave_vaisselle: "Lave-vaisselle",
};

function getLabel(value: string | null): string {
  if (!value) return "Non renseigné";
  return LABELS[value] || value;
}

export default function Profil() {
  const [isLoading, setIsLoading] = useState(true);
  const [housingProfile, setHousingProfile] = useState<HousingProfile | null>(null);
  const [hasCompletedForm, setHasCompletedForm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if form was completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("housing_form_completed")
          .eq("id", user.id)
          .maybeSingle();

        setHasCompletedForm(profile?.housing_form_completed || false);

        // Fetch housing profile
        const { data: housing } = await supabase
          .from("housing_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setHousingProfile(housing);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasCompletedForm || !housingProfile) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mon profil</h1>
          <p className="text-muted-foreground mt-1">
            Consultez vos informations logement.
          </p>
        </div>
        
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Informations non renseignées
          </h2>
          <p className="text-muted-foreground text-sm">
            Vous n'avez pas encore complété vos informations logement.
            Consultez le SMS que vous avez reçu pour accéder au formulaire.
          </p>
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      icon: Home,
      label: "Type de logement",
      value: getLabel(housingProfile.type_logement),
    },
    {
      icon: Ruler,
      label: "Surface",
      value: housingProfile.surface ? `${housingProfile.surface} m²` : "Non renseigné",
    },
    {
      icon: Users,
      label: "Occupants",
      value: housingProfile.nombre_occupants ? `${housingProfile.nombre_occupants} personne(s)` : "Non renseigné",
    },
    {
      icon: Flame,
      label: "Mode de chauffage",
      value: getLabel(housingProfile.mode_chauffage),
    },
    {
      icon: Zap,
      label: "Fournisseur électricité",
      value: getLabel(housingProfile.fournisseur_electricite),
    },
    {
      icon: Euro,
      label: "Facture électricité",
      value: housingProfile.montant_facture ? `${housingProfile.montant_facture} €/mois` : "Non renseigné",
    },
    {
      icon: Globe,
      label: "Type connexion Internet",
      value: getLabel(housingProfile.type_connexion),
    },
    {
      icon: Globe,
      label: "Fournisseur Internet",
      value: getLabel(housingProfile.fournisseur_internet),
    },
    {
      icon: Euro,
      label: "Prix Internet",
      value: housingProfile.prix_mensuel_internet ? `${housingProfile.prix_mensuel_internet} €/mois` : "Non renseigné",
    },
    {
      icon: Car,
      label: "Véhicule électrique",
      value: housingProfile.recharge_vehicule_electrique ? "Oui" : "Non",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mon profil</h1>
        <p className="text-muted-foreground mt-1">
          Résumé de vos informations logement (lecture seule).
        </p>
      </div>
      
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Mes informations logement
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {infoItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <item.icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {housingProfile.equipements_energivores && housingProfile.equipements_energivores.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Équipements énergivores</p>
            <div className="flex flex-wrap gap-2">
              {housingProfile.equipements_energivores.map((equip) => (
                <span 
                  key={equip}
                  className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                >
                  {getLabel(equip)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
