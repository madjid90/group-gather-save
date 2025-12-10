import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
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

// Status display mapping
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

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, prenom, nom, telephone, statut, housing_token, housing_form_completed")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setHasHousingProfile(profileData.housing_form_completed === true);

      // Fetch current/latest offer (only if status is sent)
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

  // Get display status based on profile state
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
            <p className="text-muted-foreground mb-4">Veuillez vous connecter pour accéder à votre espace.</p>
            <Button asChild>
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header with Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Switchly</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Bienvenue, {profile.prenom} 👋
              </h1>
              <p className="text-muted-foreground">
                Membre de l'achat groupé
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">État de votre dossier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${displayStatus.color}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{displayStatus.label}</p>
                <p className="text-sm text-muted-foreground">
                  {!hasHousingProfile && "Complétez votre profil pour recevoir une offre personnalisée"}
                  {hasHousingProfile && !currentOffer && "Nous négocions actuellement les meilleures réductions"}
                  {currentOffer?.statut === "envoyee" && "Consultez votre offre personnalisée"}
                  {currentOffer?.statut === "acceptee" && "Merci ! Votre offre est validée"}
                  {currentOffer?.statut === "refusee" && "Vous serez recontacté pour la prochaine campagne"}
                </p>
              </div>
            </div>

            {/* Dynamic Message */}
            {!hasHousingProfile && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">
                    Pour recevoir votre offre personnalisée, merci de compléter votre profil logement.
                  </p>
                  <Button className="mt-3" asChild>
                    <Link to={`/formulaire-logement/${profile.housing_token}`}>
                      <Home className="w-4 h-4 mr-2" />
                      Compléter mon profil
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {hasHousingProfile && !currentOffer && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Votre profil est complet ! Nous négocions actuellement les meilleures réductions pour votre groupe — jusqu'à -30 %.
                  Vous recevrez un SMS dès que votre offre sera disponible.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offer Button - Only visible when offer is available */}
        {showOfferButton && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Votre offre est prête !</h2>
              <p className="text-muted-foreground mb-4">
                Consultez votre offre personnalisée négociée grâce au groupe.
              </p>
              
              {currentOffer.statut === "acceptee" ? (
                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-base">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Offre acceptée
                </Badge>
              ) : (
                <Button size="lg" asChild>
                  <Link to={`/mon-offre?token=${currentOffer.offer_token}`}>
                    Voir mon offre
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Switchly - Achat groupé d'énergie et internet
        </p>
      </div>
    </div>
  );
}
