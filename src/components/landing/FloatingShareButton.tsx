import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FloatingShareButton() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShareClick = () => {
    navigate("/partage-accueil");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShareClick}
          className="fixed bottom-20 md:bottom-6 right-4 z-50 w-12 h-12 rounded-full bg-gradient-hero text-primary-foreground shadow-glow flex items-center justify-center"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
