import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Copy, Check, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PartageAccueil() {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/invitation` : "";
  const shareText = "💡 J'ai découvert Switchly, un achat groupé d'électricité et de box internet qui permet d'économiser jusqu'à 400€/an ! Inscription gratuite et sans engagement.";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n👉 ${shareUrl}`)}`;
    window.open(url, "_blank");
  };

  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-switchly-xl text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Partagez Switchly !
          </h1>

          <p className="text-muted-foreground mb-6">
            Aidez vos proches à économiser sur leurs factures
          </p>

          {/* Share buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              className="w-full gap-2 h-12 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
            >
              <MessageCircle className="w-5 h-5" />
              Partager sur WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={handleSMSShare}
              className="w-full gap-2 h-12 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
            >
              <MessageCircle className="w-5 h-5" />
              Partager par SMS
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyLink}
              className={`w-full gap-2 h-12 ${
                copied 
                  ? 'bg-secondary/10 border-secondary text-secondary' 
                  : 'bg-muted/50 border-border hover:bg-muted'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Lien copié !
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copier le lien
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="default" asChild className="w-full">
              <Link to="/inscription">
                Je m'inscris aussi
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
