import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, MessageCircle, Mail, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FloatingShareButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/inscription` : "";
  const shareText = "Rejoins l'achat groupé Switchly pour économiser sur tes factures d'énergie !";

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setIsOpen(false);
  };

  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.location.href = url;
    setIsOpen(false);
  };

  const handleEmailShare = () => {
    const subject = "Économise sur tes factures d'énergie avec Switchly";
    const body = `${shareText}\n\nInscris-toi gratuitement ici : ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setIsOpen(false);
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
      setIsOpen(true);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Share options panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed bottom-24 right-4 z-50 bg-card border border-border rounded-xl p-4 shadow-switchly-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Partager Switchly</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsAppShare}
                    className="gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSMSShare}
                    className="gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">SMS</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmailShare}
                    className="gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Plus on est nombreux, plus on économise !
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-20 md:bottom-6 right-4 z-50 w-12 h-12 rounded-full bg-gradient-hero text-primary-foreground shadow-glow flex items-center justify-center"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
