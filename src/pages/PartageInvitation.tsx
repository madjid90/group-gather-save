import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Copy, Check, PartyPopper, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PartageInvitation() {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/invitation` : "";
  const shareText = "🎉 Je viens de m'inscrire à l'achat groupé Switchly pour économiser sur mes factures d'électricité et d'internet ! Rejoins-moi vite, plus on est nombreux, plus les prix baissent.";

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
            className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          >
            <PartyPopper className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Inscription réussie ! 🎉
          </h1>

          <p className="text-muted-foreground mb-6">
            Invitez vos proches pour faire baisser les prix
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

          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link to="/">
              Continuer vers l'accueil
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
