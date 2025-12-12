import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function MobileFixedCTA() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg md:hidden"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.02, 1],
          boxShadow: [
            "0 0 0 0 rgba(71, 199, 119, 0)",
            "0 0 0 8px rgba(71, 199, 119, 0.15)",
            "0 0 0 0 rgba(71, 199, 119, 0)"
          ]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="rounded-xl"
      >
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full py-4 text-sm font-semibold"
          asChild
        >
          <Link to="/inscription">
            Je rejoins l'achat groupé gratuitement
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
