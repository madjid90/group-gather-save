import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function MobileFixedCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Apparaît seulement après avoir scrollé de 400px (= sous le hero)
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Fade gradient — visible uniquement quand le CTA est visible */}
      {visible && (
        <div className="fixed bottom-[80px] left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-40 md:hidden" />
      )}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            onAnimationComplete={() => {
              if (navigator.vibrate) navigator.vibrate(15);
            }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background border-t border-border md:hidden"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.04, 0.97, 1.02, 1] }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
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
        )}
      </AnimatePresence>
    </>
  );
}
