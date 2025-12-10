import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle py-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card rounded-xl p-5 shadow-switchly border border-border text-center"
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Switchly</span>
        </Link>

        {/* 404 */}
        <div className="text-6xl font-bold text-primary mb-3">404</div>
        
        <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-2">
          Page introuvable
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* CTA */}
        <Button variant="hero" size="lg" className="w-full py-3 text-sm" asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
