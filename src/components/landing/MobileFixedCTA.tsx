import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Gift } from "lucide-react";

export function MobileFixedCTA() {
  return (
    <>
      {/* Gradient fade effect */}
      <div className="fixed bottom-[88px] left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-40 md:hidden" />
      
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-3 bg-background border-t border-border/50 md:hidden"
      >
        {/* Trust badges */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card border border-border text-xs">
            <MessageSquare className="w-3 h-3 text-primary" />
            <span className="font-medium text-foreground">100% digital</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card border border-border text-xs">
            <Gift className="w-3 h-3 text-secondary" />
            <span className="font-medium text-foreground">100% gratuit</span>
          </div>
        </div>
        
        {/* CTA Button */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full py-4 text-sm font-semibold"
            asChild
          >
            <Link to="/inscription">
              Rejoindre l'achat groupé gratuitement
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
