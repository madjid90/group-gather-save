import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Euro, Zap, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserOffer {
  id: string;
  user_id: string;
  offre_nom: string | null;
  fournisseur_nom: string | null;
  prix_kwh: number | null;
  abonnement_mensuel: number | null;
  economie_estimee_mensuelle: number | null;
  economie_estimee_annuelle: number | null;
  commentaire_fournisseur: string | null;
  statut: string | null;
  offer_token: string | null;
}

interface Profile {
  prenom: string;
  nom: string;
}

export default function MonOffre() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [offer, setOffer] = useState<UserOffer | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchOffer();
    } else {
      setError("Lien invalide. Veuillez utiliser le lien reçu par SMS.");
      setLoading(false);
    }
  }, [token]);

  const fetchOffer = async () => {
    try {
      // Find offer by token
      const { data: offerData, error: offerError } = await supabase
        .from("user_offers")
        .select("*")
        .eq("offer_token", token)
        .maybeSingle();

      if (offerError) throw offerError;

      if (!offerData) {
        setError("Offre non trouvée ou lien expiré.");
        setLoading(false);
        return;
      }

      setOffer(offerData);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("prenom, nom")
        .eq("id", offerData.user_id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.error("Error fetching offer:", err);
      setError("Erreur lors du chargement de l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!offer) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("user_offers")
        .update({ statut: "acceptee" })
        .eq("id", offer.id);

      if (error) throw error;

      // Update user profile status
      await supabase
        .from("profiles")
        .update({ statut: "souscription" })
        .eq("id", offer.user_id);

      // Update campaign_users status
      await supabase
        .from("campaign_users")
        .update({ statut_dans_campagne: "offre_acceptee" })
        .eq("user_id", offer.user_id);

      toast.success("Merci ! Votre acceptation a été enregistrée.");
      navigate("/offre-confirmation?status=acceptee");
    } catch (err) {
      console.error("Error accepting offer:", err);
      toast.error("Erreur lors de l'enregistrement de votre réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuse = async () => {
    if (!offer) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("user_offers")
        .update({ statut: "refusee" })
        .eq("id", offer.id);

      if (error) throw error;

      // Update profile status back to inscrit
      await supabase
        .from("profiles")
        .update({ statut: "inscrit" })
        .eq("id", offer.user_id);

      toast.success("Votre réponse a été enregistrée.");
      navigate("/offre-confirmation?status=refusee");
    } catch (err) {
      console.error("Error refusing offer:", err);
      toast.error("Erreur lors de l'enregistrement de votre réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Chargement de votre offre...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Oups !</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  const hasResponded = offer.statut === "acceptee" || offer.statut === "refusee";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Votre offre personnalisée Switchly
          </h1>
          {profile && (
            <p className="text-muted-foreground">
              Bonjour {profile.prenom} {profile.nom}
            </p>
          )}
        </div>

        {/* Main Offer Card */}
        <Card className="overflow-hidden">
          <div className="bg-primary text-primary-foreground p-6 text-center">
            <p className="text-sm opacity-90 mb-2">Économie estimée</p>
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="h-8 w-8" />
              <span className="text-4xl font-bold">
                {offer.economie_estimee_mensuelle?.toFixed(0) || "0"} €
              </span>
              <span className="text-lg opacity-90">/mois</span>
            </div>
            <p className="mt-2 text-lg">
              Soit{" "}
              <span className="font-bold">
                {offer.economie_estimee_annuelle?.toFixed(0) || "0"} € par an
              </span>
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Offer Details */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Détails de l'offre
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Offre</p>
                  <p className="font-medium">{offer.offre_nom || "-"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">{offer.fournisseur_nom || "-"}</p>
                </div>
                {offer.prix_kwh && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Prix kWh</p>
                    <p className="font-medium">{offer.prix_kwh.toFixed(4)} €</p>
                  </div>
                )}
                {offer.abonnement_mensuel && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Abonnement</p>
                    <p className="font-medium">{offer.abonnement_mensuel.toFixed(2)} €/mois</p>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Comment */}
            {offer.commentaire_fournisseur && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Note du fournisseur</h3>
                  <p className="text-muted-foreground text-sm bg-muted p-3 rounded-lg">
                    {offer.commentaire_fournisseur}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Response Status or Buttons */}
            {hasResponded ? (
              <div className="text-center py-4">
                {offer.statut === "acceptee" ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="font-semibold text-lg">Offre acceptée</p>
                    <p className="text-muted-foreground text-sm">
                      Merci ! Nous vous recontacterons pour finaliser votre souscription.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-12 w-12 text-muted-foreground" />
                    <p className="font-semibold text-lg">Offre refusée</p>
                    <p className="text-muted-foreground text-sm">
                      Nous avons bien enregistré votre réponse.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Cette offre a été calculée à partir de votre profil logement.
                  <br />
                  Vous pouvez économiser jusqu'à{" "}
                  <strong>{offer.economie_estimee_annuelle?.toFixed(0) || "0"} € par an</strong>.
                </p>
                <div className="flex gap-4">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleAccept}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    J'accepte cette offre
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={handleRefuse}
                    disabled={submitting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Je refuse
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Switchly - Achat groupé d'énergie et internet
        </p>
      </div>
    </div>
  );
}
