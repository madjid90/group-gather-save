import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareSection() {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/inscription` : "";
  const shareText = "Rejoins l'achat groupé Switchly pour économiser sur tes factures d'énergie !";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, "_blank");
  };

  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.location.href = url;
  };

  const handleEmailShare = () => {
    const subject = "Économise sur tes factures d'énergie avec Switchly";
    const body = `${shareText}\n\nInscris-toi gratuitement ici : ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Switchly - Achat groupé énergie",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <section className="py-10 lg:py-16 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 lg:mb-4">
            Invitez vos proches, économisez encore plus
          </h2>

          {/* Subtitle */}
          <p className="text-sm lg:text-lg text-muted-foreground mb-6 lg:mb-8 max-w-lg mx-auto">
            Plus le groupe grandit, plus nous négocions des tarifs avantageux.
            <span className="hidden lg:inline"><br />Partagez votre lien d'inscription à vos proches.</span>
          </p>

          {/* Share buttons - Desktop */}
          <div className="hidden lg:flex flex-wrap justify-center gap-3 mb-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleWhatsAppShare}
              className="gap-2"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSMSShare}
              className="gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              SMS
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleEmailShare}
              className="gap-2"
            >
              <Mail className="w-5 h-5" />
              Email
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? <Check className="w-5 h-5 text-secondary" /> : <Copy className="w-5 h-5" />}
              {copied ? "Copié !" : "Copier le lien"}
            </Button>
          </div>

          {/* Share button - Mobile (native share) */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="lg"
              onClick={handleNativeShare}
              className="gap-2 w-full max-w-xs"
            >
              <Share2 className="w-5 h-5" />
              Partager mon lien
            </Button>
          </div>

          {/* Micro-texte rassurant */}
          <p className="text-xs text-muted-foreground mt-4">
            Lien personnel • Aucun engagement pour vos proches
          </p>
        </motion.div>
      </div>
    </section>
  );
}
