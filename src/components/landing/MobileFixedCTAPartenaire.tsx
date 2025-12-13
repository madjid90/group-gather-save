import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function MobileFixedCTAPartenaire() {
  return (
    <>
      {/* Gradient fade effect */}
      <div className="fixed bottom-[52px] left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-40 md:hidden" />
      
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 py-1 bg-background md:hidden flex justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full"
        >
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full py-4 text-sm font-semibold"
            asChild
          >
            <Link to="/demande-partenaire">
              Organiser un achat groupé
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
