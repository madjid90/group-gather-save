import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Home,
  FileCheck,
  Gift,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  TrendingDown,
  Zap,
  Flame,
  Wifi,
  Euro,
  AlertCircle,
  Clock,
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

interface HousingProfile {
  type_logement: string | null;
  surface: number | null;
  mode_chauffage: string | null;
  isolation: string | null;
  montant_facture: number | null;
  fournisseur_electricite: string | null;
  type_connexion: string | null;
  prix_mensuel_internet: number | null;
  fournisseur_internet: string | null;
  equipements_energivores: string[] | null;
}

interface UserOffer {
  id: string;
  offre_nom: string | null;
  fournisseur_nom: string | null;
  economie_estimee_mensuelle: number | null;
  economie_estimee_annuelle: number | null;
  statut: string | null;
  campaign_id: string | null;
  offer_token: string | null;
}

interface CampaignHistory {
  campaign_name: string;
  statut: string;
  economie: number | null;
}

// Map status to display info (based on user_status enum: inscrit, offre_envoyee, clic, souscription)
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  inscrit: { label: "Membre du groupe — En attente d'offre négociée", color: "bg-blue-100 text-blue-800" },
  offre_envoyee: { label: "Offre groupée disponible", color: "bg-yellow-100 text-yellow-800" },
  clic: { label: "En attente de décision", color: "bg-orange-100 text-orange-800" },
  souscription: { label: "Offre groupée acceptée", color: "bg-emerald-100 text-emerald-800" },
};

export default function DashboardClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [housingProfile, setHousingProfile] = useState<HousingProfile | null>(null);
  const [currentOffer, setCurrentOffer] = useState<UserOffer | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      // Get current user
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

      // Fetch housing profile
      const { data: housingData } = await supabase
        .from("housing_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setHousingProfile(housingData);

      // Fetch current/latest offer
      const { data: offerData } = await supabase
        .from("user_offers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentOffer(offerData);

      // Fetch campaign history with offers
      const { data: offersHistory } = await supabase
        .from("user_offers")
        .select(`
          id,
          statut,
          economie_estimee_annuelle,
          campaign_id,
          campaigns!user_offers_campaign_id_fkey (nom)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (offersHistory) {
        const history: CampaignHistory[] = offersHistory.map((offer: any) => ({
          campaign_name: offer.campaigns?.nom || "Campagne",
          statut: offer.statut || "envoyee",
          economie: offer.statut === "acceptee" ? offer.economie_estimee_annuelle : null,
        }));
        setCampaignHistory(history);
      }

    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!currentOffer || !profile) return;
    setSubmitting(true);

    try {
      // Update offer status
      const { error: offerError } = await supabase
        .from("user_offers")
        .update({ statut: "acceptee" })
        .eq("id", currentOffer.id);

      if (offerError) throw offerError;

      // Update profile status
      await supabase
        .from("profiles")
        .update({ statut: "souscription" })
        .eq("id", profile.id);

      // Update campaign_users if exists
      if (currentOffer.campaign_id) {
        await supabase
          .from("campaign_users")
          .update({ statut_dans_campagne: "offre_acceptee" })
          .eq("user_id", profile.id)
          .eq("campaign_id", currentOffer.campaign_id);
      }

      toast.success("Offre acceptée avec succès !");
      navigate("/offre-confirmation?status=acceptee");
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Erreur lors de l'acceptation de l'offre");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuseOffer = async () => {
    if (!currentOffer || !profile) return;
    setSubmitting(true);

    try {
      // Update offer status
      const { error: offerError } = await supabase
        .from("user_offers")
        .update({ statut: "refusee" })
        .eq("id", currentOffer.id);

      if (offerError) throw offerError;

      // Update profile status back to inscrit
      await supabase
        .from("profiles")
        .update({ statut: "inscrit" })
        .eq("id", profile.id);

      toast.success("Votre réponse a été enregistrée");
      navigate("/offre-confirmation?status=refusee");
    } catch (error) {
      console.error("Error refusing offer:", error);
      toast.error("Erreur lors du refus de l'offre");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress steps
  const getProgressSteps = () => {
    const hasProfile = !!housingProfile;
    const hasOffer = !!currentOffer;
    const offerResponded = currentOffer?.statut === "acceptee" || currentOffer?.statut === "refusee";

    return [
      { label: "Inscription", completed: true, icon: User },
      { label: "Profil logement complété", completed: hasProfile, icon: Home },
      { label: "Offre groupée disponible", completed: hasOffer, icon: Gift },
      { label: "Décision de l'offre", completed: offerResponded, icon: offerResponded && currentOffer?.statut === "acceptee" ? CheckCircle : FileCheck },
    ];
  };

  // Get dynamic message based on status
  const getDynamicMessage = () => {
    const hasProfile = !!housingProfile;
    const hasOffer = !!currentOffer;
    const offerAccepted = currentOffer?.statut === "acceptee";
    const offerRefused = currentOffer?.statut === "refusee";
    const offerPending = hasOffer && !offerAccepted && !offerRefused;

    if (!hasProfile) {
      return {
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        message: "Merci de compléter votre profil logement pour recevoir votre réduction personnalisée.",
      };
    }

    if (hasProfile && !hasOffer) {
      return {
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        message: "Votre profil est validé. Nous négocions actuellement les meilleures réductions pour votre groupe — jusqu'à -30 %.",
      };
    }

    if (offerPending) {
      return {
        icon: Gift,
        color: "text-primary",
        bgColor: "bg-primary/5",
        message: "Votre offre est prête ! Profitez d'une réduction négociée exclusivement pour votre groupe.",
      };
    }

    if (offerAccepted) {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        message: "Merci ! Votre offre groupée est acceptée. Votre nouveau contrat est en cours de préparation.",
      };
    }

    if (offerRefused) {
      return {
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        message: "Vous avez refusé la dernière offre. Vous recevrez de nouvelles offres lors des prochaines campagnes.",
      };
    }

    return null;
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

  const progressSteps = getProgressSteps();
  const dynamicMessage = getDynamicMessage();
  const statusInfo = STATUS_MAP[profile.statut || "inscrit"] || STATUS_MAP.inscrit;
  const canRespondToOffer = currentOffer && currentOffer.statut !== "acceptee" && currentOffer.statut !== "refusee";

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Section 1: Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Bonjour, {profile.prenom} 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Numéro client : <span className="font-mono">{profile.telephone || "N/A"}</span>
                </p>
              </div>
              <Badge className={`${statusInfo.color} px-3 py-1 text-sm`}>
                {statusInfo.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Progress Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avancement vers votre réduction groupée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {progressSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center gap-2 sm:flex-col sm:text-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? "bg-green-100 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-sm ${step.completed ? "font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {index < progressSteps.length - 1 && (
                      <div className="hidden sm:block flex-1 h-0.5 bg-border mx-2 min-w-[40px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Dynamic Message */}
        {dynamicMessage && (
          <Card className={dynamicMessage.bgColor}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <dynamicMessage.icon className={`w-6 h-6 ${dynamicMessage.color} flex-shrink-0 mt-0.5`} />
                <p className="text-foreground">{dynamicMessage.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Housing Profile Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Votre profil logement (base de votre réduction négociée)
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/formulaire-logement/${profile.housing_token}`}>
                <Edit className="w-4 h-4 mr-2" />
                {housingProfile ? "Modifier" : "Compléter"}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {housingProfile ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Home className="w-4 h-4" />
                    Type
                  </div>
                  <p className="font-medium capitalize">{housingProfile.type_logement || "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Home className="w-4 h-4" />
                    Surface
                  </div>
                  <p className="font-medium">{housingProfile.surface ? `${housingProfile.surface} m²` : "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Flame className="w-4 h-4" />
                    Chauffage
                  </div>
                  <p className="font-medium capitalize">{housingProfile.mode_chauffage?.replace("_", " ") || "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Zap className="w-4 h-4" />
                    Fournisseur élec.
                  </div>
                  <p className="font-medium uppercase">{housingProfile.fournisseur_electricite || "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Euro className="w-4 h-4" />
                    Facture mensuelle
                  </div>
                  <p className="font-medium">{housingProfile.montant_facture ? `${housingProfile.montant_facture} €` : "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Wifi className="w-4 h-4" />
                    Internet
                  </div>
                  <p className="font-medium capitalize">{housingProfile.type_connexion || "-"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Vous faites partie de notre achat groupé. Nous négocions pour votre groupe une réduction pouvant aller jusqu'à -30 %. Vous serez averti dès qu'une offre personnalisée est disponible.
                </p>
                <Button asChild>
                  <Link to={`/formulaire-logement/${profile.housing_token}`}>
                    Compléter mon profil
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Current Offer */}
        {currentOffer && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Votre offre négociée grâce au groupe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Grâce à l'achat groupé, vous pouvez économiser jusqu'à -30 % sur votre contrat.
              </p>
              
              {/* Savings highlight */}
              <div className="bg-primary/5 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">💸 Économies estimées</p>
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="w-8 h-8 text-primary" />
                  <span className="text-4xl font-bold text-primary">
                    {currentOffer.economie_estimee_annuelle?.toFixed(0) || "0"} €
                  </span>
                  <span className="text-lg text-muted-foreground">/ an</span>
                </div>
                <p className="text-muted-foreground mt-1">
                  Soit <strong>{currentOffer.economie_estimee_mensuelle?.toFixed(0) || "0"} €</strong> par mois
                </p>
              </div>

              {/* Offer details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Offre</p>
                  <p className="font-medium">{currentOffer.offre_nom || "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">{currentOffer.fournisseur_nom || "-"}</p>
                </div>
              </div>

              {/* Action buttons or status */}
              {canRespondToOffer ? (
                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleAcceptOffer}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    J'accepte l'offre groupée
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={handleRefuseOffer}
                    disabled={submitting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Je refuse
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  {currentOffer.statut === "acceptee" ? (
                    <Badge className="bg-green-100 text-green-800 px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Offre acceptée
                    </Badge>
                  ) : currentOffer.statut === "refusee" ? (
                    <Badge className="bg-gray-100 text-gray-600 px-4 py-2">
                      <XCircle className="w-4 h-4 mr-2" />
                      Offre refusée
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2">
                      En attente de réponse
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section 5: Campaign History */}
        {campaignHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique de vos offres groupées</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campagne</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Économie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.campaign_name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            item.statut === "acceptee" 
                              ? "border-green-200 bg-green-50 text-green-700" 
                              : item.statut === "refusee"
                              ? "border-gray-200 bg-gray-50 text-gray-600"
                              : "border-yellow-200 bg-yellow-50 text-yellow-700"
                          }
                        >
                          {item.statut === "acceptee" ? "Acceptée" : item.statut === "refusee" ? "Refusée" : "Envoyée"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.economie ? `${item.economie.toFixed(0)} €/an` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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