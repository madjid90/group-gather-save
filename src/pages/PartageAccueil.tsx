import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  Mail, 
  Copy, 
  Check, 
  Users, 
  TrendingDown,
  Share2,
  ChevronRight,
  Sparkles,
  Zap
} from "lucide-react";
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

  const handleEmailShare = () => {
    const subject = "💡 Découvre Switchly - Économise sur tes factures d'énergie";
    const body = `Salut !\n\n${shareText}\n\nInscris-toi gratuitement ici : ${shareUrl}\n\nÀ bientôt !`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Switchly - Achat groupé énergie & internet",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--accent))',
              left: `${10 + (i * 7)}%`,
              top: `${20 + (i * 5) % 60}%`,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 py-10 sm:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Share card */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-switchly-xl text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
            >
              Partagez la bonne nouvelle !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-8"
            >
              Aidez vos proches à économiser sur leurs factures
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-muted/50 rounded-2xl p-4 mb-8"
            >
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Plus on est nombreux</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-secondary/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Plus les prix baissent</p>
                </div>
              </div>
            </motion.div>

            {/* Message preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-muted/30 rounded-xl p-4 mb-6 text-left"
            >
              <div className="flex items-start gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground font-medium">Message pré-écrit</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {shareText}
              </p>
            </motion.div>

            {/* Share section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Choisissez votre méthode
              </h2>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppShare}
                    className="w-full gap-2 h-12 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleSMSShare}
                    className="w-full gap-2 h-12 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-700"
                  >
                    <MessageCircle className="w-5 h-5" />
                    SMS
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleEmailShare}
                    className="w-full gap-2 h-12 bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 text-purple-700"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className={`w-full gap-2 h-12 transition-all ${
                      copied 
                        ? 'bg-secondary/10 border-secondary text-secondary' 
                        : 'bg-muted/50 border-border hover:bg-muted'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copier le lien
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Native share button (mobile) */}
              {'share' in navigator && (
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="mb-6"
                >
                  <Button
                    variant="hero"
                    onClick={handleNativeShare}
                    className="w-full gap-2 h-12"
                  >
                    <Share2 className="w-5 h-5" />
                    Partager
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Back button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-2"
            >
              <Button
                variant="default"
                asChild
                className="w-full"
              >
                <Link to="/inscription">
                  Je m'inscris aussi
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
