import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Zap, TrendingDown, Loader2, ArrowLeft, Home, Clock } from "lucide-react";
import { toast } from "sonner";
import { useClickTracking } from "@/hooks/useClickTracking";

interface UserOffer {
  id: string;
  offre_nom: string | null;
  fournisseur_nom: string | null;
  prix_kwh: number | null;
  abonnement_mensuel: number | null;
  economie_estimee_mensuelle: number | null;
  economie_estimee_annuelle: number | null;
  commentaire_fournisseur: string | null;
  statut: string | null;
  is_expired: boolean;
}

export default function MonOffre() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { trackOfferAccepted, trackOfferRefused } = useClickTracking();

  const [offer, setOffer] = useState<UserOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (token) {
      fetchOffer();
    } else {
      setError("Lien invalide. Veuillez utiliser le lien reçu par SMS.");
      setLoading(false);
    }
  }, [token]);

  const fetchOffer = async () => {
    try {
      // Use secure function that doesn't expose user_id or client_id
      const { data: offerData, error: offerError } = await supabase
        .rpc("get_offer_by_token", { p_token: token });

      if (offerError) throw offerError;

      if (!offerData || offerData.length === 0) {
        setError("Offre non trouvée ou lien expiré.");
        setLoading(false);
        return;
      }

      const offerRecord = offerData[0];
      
      if (offerRecord.is_expired) {
        setError("Ce lien a expiré. Veuillez contacter le support pour obtenir un nouveau lien.");
        setLoading(false);
        return;
      }

      setOffer(offerRecord);
    } catch (err) {
      console.error("Error fetching offer:", err);
      setError("Erreur lors du chargement de l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!offer || !token) return;
    setSubmitting(true);

    try {
      // Use secure function to update status
      const { data: success, error } = await supabase
        .rpc("update_offer_status_by_token", { p_token: token, p_statut: "acceptee" });

      if (error) throw error;
      
      if (!success) {
        toast.error("Ce lien a expiré ou n'est plus valide.");
        return;
      }

      // Track the acceptance
      trackOfferAccepted(offer.id);

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
    if (!offer || !token) return;
    setSubmitting(true);

    try {
      // Use secure function to update status
      const { data: success, error } = await supabase
        .rpc("update_offer_status_by_token", { p_token: token, p_statut: "refusee" });

      if (error) throw error;
      
      if (!success) {
        toast.error("Ce lien a expiré ou n'est plus valide.");
        return;
      }

      // Track the refusal
      trackOfferRefused(offer.id);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
        <Card className="max-w-md w-full rounded-xl border border-border shadow-switchly">
          <CardContent className="pt-6 text-center">
            {error.includes("expiré") ? (
              <Clock className="h-10 w-10 mx-auto text-amber-500 mb-3" />
            ) : (
              <XCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
            )}
            <h2 className="text-lg font-semibold mb-2 text-foreground">
              {error.includes("expiré") ? "Lien expiré" : "Oups !"}
            </h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Link to="/" className="inline-block mt-4">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offer) return null;

  const hasResponded = offer.statut === "acceptee" || offer.statut === "refusee";

  return (
    <div className="min-h-screen bg-gradient-subtle py-6 px-4 relative">
      {/* Fixed Navigation */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>

      <div className="max-w-lg mx-auto space-y-4 pt-12">
        {/* Header */}
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Switchly</span>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-1">
            Votre réduction groupée est prête 🎉
          </h1>
        </div>

        {/* Main Offer Card */}
        <Card className="rounded-xl border border-border shadow-switchly overflow-hidden">
          <div className="bg-primary text-primary-foreground p-4 text-center">
            <p className="text-xs opacity-90 mb-1">💸 Économies estimées</p>
            <div className="flex items-center justify-center gap-1.5">
              <TrendingDown className="h-6 w-6" />
              <span className="text-3xl font-bold">
                {offer.economie_estimee_annuelle?.toFixed(0) || "0"} €
              </span>
              <span className="text-sm opacity-90">/ an</span>
            </div>
            <p className="mt-1 text-sm">
              Soit <span className="font-bold">{offer.economie_estimee_mensuelle?.toFixed(0) || "0"} € / mois</span>
            </p>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Offer Details */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Détails de l'offre
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Offre</p>
                  <p className="font-medium text-sm text-foreground">{offer.offre_nom || "-"}</p>
                </div>
                <div className="p-2.5 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Fournisseur</p>
                  <p className="font-medium text-sm text-foreground">{offer.fournisseur_nom || "-"}</p>
                </div>
                {offer.prix_kwh && (
                  <div className="p-2.5 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Prix kWh</p>
                    <p className="font-medium text-sm text-foreground">{offer.prix_kwh.toFixed(4)} €</p>
                  </div>
                )}
                {offer.abonnement_mensuel && (
                  <div className="p-2.5 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Abonnement</p>
                    <p className="font-medium text-sm text-foreground">{offer.abonnement_mensuel.toFixed(2)} €/mois</p>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Comment */}
            {offer.commentaire_fournisseur && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-foreground">Note du fournisseur</h3>
                  <p className="text-xs text-muted-foreground bg-muted p-2.5 rounded-lg">
                    {offer.commentaire_fournisseur}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Response Status or Buttons */}
            {hasResponded ? (
              <div className="text-center py-2">
                {offer.statut === "acceptee" ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <p className="font-semibold text-foreground">Offre acceptée</p>
                    <p className="text-xs text-muted-foreground">
                      Nous vous recontacterons pour finaliser votre souscription.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="font-semibold text-foreground">Offre refusée</p>
                    <p className="text-xs text-muted-foreground">
                      Nous avons bien enregistré votre réponse.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full py-3 text-sm"
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
                  size="lg"
                  className="w-full py-3 text-sm"
                  onClick={handleRefuse}
                  disabled={submitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Je refuse cette offre
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Switchly - Achat groupé d'énergie et internet
        </p>
      </div>
    </div>
  );
}