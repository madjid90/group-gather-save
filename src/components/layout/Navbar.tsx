import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">Switchly</span>
        </Link>

        {/* Right side: CTA Buttons + Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4" asChild>
                <Link to="/dashboard-client">
                  <User className="w-4 h-4 mr-1 sm:mr-2" />
                  Mon espace
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm px-2 sm:px-4"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4" asChild>
                <Link to="/connexion">Connexion</Link>
              </Button>
              <Button variant="hero" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm px-3 sm:px-4" asChild>
                <Link to="/inscription">Rejoindre</Link>
              </Button>
            </>
          )}
          
          {/* Hamburger Menu Button */}
          <button
            ref={buttonRef}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Dropdown Menu - Contains only navigation links */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 left-0 right-0 z-50 bg-card border-b border-border shadow-lg"
            >
              <div className="container mx-auto px-4 py-4">
                {/* Navigation Links */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-medium py-3 px-4 rounded-lg transition-colors hover:bg-muted ${
                        location.pathname === link.href
                          ? "text-primary bg-primary/5"
                          : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                {/* CTA Button - Mobile only */}
                {!user && (
                  <div className="mt-4 pt-4 border-t border-border sm:hidden">
                    <Button variant="hero" size="lg" className="w-full" asChild>
                      <Link to="/inscription" onClick={() => setIsOpen(false)}>
                        Rejoindre l'achat groupé
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
