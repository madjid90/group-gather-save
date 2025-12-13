import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "switchly_cookie_consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setIsVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "dismissed");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-switchly p-4 md:p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground text-sm md:text-base flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-primary sm:hidden" />
                    Nous respectons votre vie privée
                  </h3>
                  <button
                    onClick={handleClose}
                    className="p-1 rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
                    aria-label="Fermer le bandeau cookies"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                
                <p className="text-xs md:text-sm text-foreground/80 mb-4 leading-relaxed">
                  Nous utilisons des cookies essentiels pour le fonctionnement du site. 
                  Aucun cookie publicitaire n'est utilisé.{" "}
                  <Link 
                    to="/politique-confidentialite" 
                    className="text-primary font-semibold hover:underline"
                  >
                    En savoir plus
                  </Link>
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAccept}
                    size="sm"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Accepter
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground/10 font-semibold"
                  >
                    Refuser
                  </Button>
                  <Link 
                    to="/politique-rgpd"
                    className="text-xs text-foreground/70 hover:text-foreground transition-colors self-center mt-1 sm:mt-0 sm:ml-2 font-medium"
                  >
                    Politique RGPD
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
