import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Zap } from "lucide-react";

export default function OffreConfirmation() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const isAccepted = status === "acceptee";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle py-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card rounded-xl p-5 shadow-switchly border border-border text-center"
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Switchly</span>
        </Link>

        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isAccepted ? "bg-secondary/10" : "bg-muted"}`}>
          {isAccepted ? (
            <CheckCircle className="w-7 h-7 text-secondary" />
          ) : (
            <XCircle className="w-7 h-7 text-muted-foreground" />
          )}
        </div>

        {/* Message */}
        <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-2">
          {isAccepted ? "Merci pour votre confiance !" : "Votre choix a été enregistré"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {isAccepted 
            ? "Votre acceptation a bien été enregistrée. Nous vous recontacterons très prochainement pour finaliser votre souscription." 
            : "Vous avez refusé cette offre. Vous serez recontacté lors de la prochaine campagne de négociation."}
        </p>

        {/* CTA */}
        <Button variant="hero" size="lg" className="w-full py-3 text-sm" asChild>
          <Link to="/dashboard-client">Accéder à mon espace</Link>
        </Button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4">
          Switchly - Achat groupé d'énergie et internet
        </p>
      </motion.div>
    </div>
  );
}
