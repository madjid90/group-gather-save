import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileCheck,
  Gift,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  AlertCircle,
  LogOut,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  statut: string | null;
  housing_token: string | null;
  housing_form_completed: boolean | null;
}

interface UserOffer {
  id: string;
  offre_nom: string | null;
  fournisseur_nom: string | null;
  economie_estimee_mensuelle: number | null;
  economie_estimee_annuelle: number | null;
  statut: string | null;
  offer_token: string | null;
}

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  inscrit: { 
    label: "Dossier en attente", 
    icon: Clock, 
    color: "bg-blue-100 text-blue-800" 
  },
  profil_ok: { 
    label: "Profil complet - En négociation", 
    icon: FileCheck, 
    color: "bg-yellow-100 text-yellow-800" 
  },
  offre_envoyee: { 
    label: "Offre disponible", 
    icon: Gift, 
    color: "bg-green-100 text-green-800" 
  },
  souscription: { 
    label: "Offre acceptée", 
    icon: CheckCircle, 
    color: "bg-emerald-100 text-emerald-800" 
  },
};

export default function DashboardClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasHousingProfile, setHasHousingProfile] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<UserOffer | null>(null);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/connexion");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone, statut, housing_token, housing_form_completed")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setHasHousingProfile(profileData.housing_form_completed === true);

      const { data: offerData } = await supabase
        .from("user_offers")
        .select("id, offre_nom, fournisseur_nom, economie_estimee_mensuelle, economie_estimee_annuelle, statut, offer_token")
        .eq("user_id", user.id)
        .in("statut", ["envoyee", "acceptee", "refusee"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentOffer(offerData);

    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getDisplayStatus = () => {
    if (currentOffer?.statut === "acceptee") {
      return STATUS_MAP.souscription;
    }
    if (currentOffer && currentOffer.statut !== "refusee") {
      return STATUS_MAP.offre_envoyee;
    }
    if (hasHousingProfile) {
      return STATUS_MAP.profil_ok;
    }
    return STATUS_MAP.inscrit;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
        <Card className="max-w-md w-full rounded-xl border border-border shadow-switchly">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
            <h2 className="text-lg font-semibold mb-2 text-foreground">Accès non autorisé</h2>
            <p className="text-sm text-muted-foreground mb-4">Veuillez vous connecter pour accéder à votre espace.</p>
            <Button variant="hero" size="lg" className="w-full py-3 text-sm" asChild>
              <Link to="/connexion">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayStatus = getDisplayStatus();
  const StatusIcon = displayStatus.icon;
  const showOfferButton = currentOffer && currentOffer.statut !== "refusee";

  return (
    <div className="min-h-screen bg-gradient-subtle py-6 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <Home className="h-5 w-5" />
        </Link>

        {/* Header with Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Switchly</span>
          </Link>
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout} 
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>

        {/* Welcome */}
        <Card className="rounded-xl border border-border shadow-switchly">
          <CardContent className="p-4 text-center">
            <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-1">
              Bienvenue, {profile.prenom} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Membre de l'achat groupé
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="rounded-xl border border-border shadow-switchly">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">État de votre dossier</h2>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${displayStatus.color}`}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{displayStatus.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {!hasHousingProfile && "Complétez votre profil pour recevoir une offre"}
                  {hasHousingProfile && !currentOffer && "Négociation en cours"}
                  {currentOffer?.statut === "envoyee" && "Consultez votre offre personnalisée"}
                  {currentOffer?.statut === "acceptee" && "Votre offre est validée"}
                  {currentOffer?.statut === "refusee" && "Prochaine campagne à venir"}
                </p>
              </div>
            </div>

            {/* Action needed */}
            {!hasHousingProfile && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground mb-2">
                    Complétez votre profil logement pour recevoir votre offre personnalisée.
                  </p>
                  <Button variant="hero" size="sm" className="text-xs py-2" asChild>
                    <Link to={`/formulaire-logement/${profile.housing_token}`}>
                      <Home className="w-3.5 h-3.5 mr-1.5" />
                      Compléter mon profil
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {hasHousingProfile && !currentOffer && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  Votre profil est complet ! Nous négocions les meilleures réductions — jusqu'à -30 %.
                  Vous recevrez un SMS dès que votre offre sera disponible.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offer available */}
        {showOfferButton && (
          <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-switchly">
            <CardContent className="p-4 text-center">
              <Gift className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="text-base font-semibold mb-1 text-foreground">Votre offre est prête !</h2>
              <p className="text-xs text-muted-foreground mb-3">
                Consultez votre offre personnalisée négociée grâce au groupe.
              </p>
              
              {currentOffer.statut === "acceptee" ? (
                <Badge className="bg-green-100 text-green-800 px-3 py-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Offre acceptée
                </Badge>
              ) : (
                <Button variant="hero" size="lg" className="w-full py-3 text-sm" asChild>
                  <Link to={`/mon-offre?token=${currentOffer.offer_token}`}>
                    Voir mon offre
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Switchly - Achat groupé d'énergie et internet
        </p>
      </div>
    </div>
  );
}
