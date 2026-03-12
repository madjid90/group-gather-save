import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function MobileFixedCTA() {
  return (
    <>
      {/* Fade gradient above button */}
      <div className="fixed bottom-[80px] left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-40 md:hidden" />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 130 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background/98 backdrop-blur-sm border-t border-border md:hidden"
      >
        <Button
          size="lg"
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold text-sm shadow-lg"
          asChild
        >
          <Link to="/comparer">
            Comparer gratuitement
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-1.5">
          ✓ 30 sec · ✓ Sans engagement · ✓ Zéro coupure
        </p>
      </motion.div>
    </>
  );
}
