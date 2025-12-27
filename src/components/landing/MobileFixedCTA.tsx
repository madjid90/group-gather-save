import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { trackClick } from "@/hooks/useClickTracking";

export function MobileFixedCTA() {
  return (
    <>
      {/* Gradient fade effect */}
      <div className="fixed bottom-[68px] left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-40 md:hidden" />
      
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border md:hidden"
      >
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full py-4 text-sm font-semibold group"
          asChild
          onClick={() => trackClick({ eventType: 'cta_inscription', source: 'mobile_cta' })}
        >
          <Link to="/inscription">
            Rejoindre gratuitement — C'est parti !
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-1.5">
          ✓ 30 sec • ✓ Sans engagement • ✓ 2 500+ inscrits
        </p>
      </motion.div>
    </>
  );
}
