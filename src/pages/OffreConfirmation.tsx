import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Home } from "lucide-react";

export default function OffreConfirmation() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  
  const isAccepted = status === "acceptee";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-8">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {isAccepted ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Votre réduction groupée est validée ✔
                </h1>
                <p className="text-muted-foreground">
                  Merci ! Votre fournisseur finalise votre offre négociée. 
                  Vous faites désormais partie des membres ayant obtenu jusqu'à -30 % de réduction.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Votre choix a été enregistré
                </h1>
                <p className="text-muted-foreground">
                  Nous avons bien pris en compte votre décision. 
                  Vous recevrez de nouvelles offres lors des prochaines campagnes.
                </p>
              </div>
            </>
          )}

          <Button asChild variant="hero" className="mt-4">
            <Link to="/dashboard-client">
              <Home className="h-4 w-4 mr-2" />
              Retourner à mon espace
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground pt-4">
            Switchly - Achat groupé d'énergie et internet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}