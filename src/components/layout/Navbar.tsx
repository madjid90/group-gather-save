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

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-rgpd", label: "Politique RGPD" },
  { href: "/cgu", label: "CGU" },
];

// All links for desktop hamburger menu
const allDesktopLinks = [
  { href: "/", label: "Accueil" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-rgpd", label: "Politique RGPD" },
  { href: "/cgu", label: "CGU" },
];

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const desktopButtonRef = useRef<HTMLButtonElement>(null);

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Mobile menu
      if (
        isMobileOpen &&
        mobileMenuRef.current &&
        mobileButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
      // Desktop menu
      if (
        isDesktopOpen &&
        desktopMenuRef.current &&
        desktopButtonRef.current &&
        !desktopMenuRef.current.contains(event.target as Node) &&
        !desktopButtonRef.current.contains(event.target as Node)
      ) {
        setIsDesktopOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, isDesktopOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsDesktopOpen(false);
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

        {/* Right side: Desktop Hamburger + CTA Buttons + Mobile Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Hamburger Menu Button - Hidden on mobile */}
          <button
            ref={desktopButtonRef}
            className="hidden lg:flex items-center gap-2 p-2 px-3 rounded-lg hover:bg-muted transition-colors border border-border/50"
            onClick={() => setIsDesktopOpen(!isDesktopOpen)}
            aria-label="Toggle menu"
            aria-expanded={isDesktopOpen}
          >
            {isDesktopOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
            <span className="text-sm font-medium text-foreground">Menu</span>
          </button>

          {user ? (
            <>
              <Button variant="ghost" size="sm" className="text-xs sm:text-[16px] px-2 sm:px-4 h-9" asChild>
                <Link to="/dashboard-client">
                  <User className="w-4 h-4 mr-1 sm:mr-2" />
                  Mon espace
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-[16px] px-2 sm:px-4 h-9"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-xs sm:text-[16px] px-3 sm:px-4 h-9" asChild>
                <Link to="/connexion">Connexion</Link>
              </Button>
              <Button variant="hero" size="sm" className="hidden sm:inline-flex text-xs sm:text-[16px] px-4 h-9" asChild>
                <Link to="/inscription">Rejoindre</Link>
              </Button>
            </>
          )}
          
          {/* Hamburger Menu Button - Mobile only (< lg) */}
          <button
            ref={mobileButtonRef}
            className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Desktop Dropdown Menu */}
      <AnimatePresence>
        {isDesktopOpen && (
          <motion.div
            ref={desktopMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-16 right-4 z-50 bg-card border border-border rounded-xl shadow-xl hidden lg:block w-64"
          >
            <div className="py-3">
              {allDesktopLinks.map((link, index) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsDesktopOpen(false)}
                  className={`block text-[15px] font-medium py-3 px-5 transition-colors hover:bg-muted ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-foreground"
                  } ${index === 2 ? "border-b border-border mb-1 pb-4" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop overlay with darker background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Menu panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 left-0 right-0 z-50 bg-card border-b border-border shadow-lg lg:hidden"
            >
              <div className="container mx-auto px-4 py-5">
                {/* Navigation Links - Larger tap targets, reduced spacing */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`text-[17px] font-medium py-[14px] px-4 rounded-xl transition-colors hover:bg-muted active:bg-muted leading-relaxed ${
                        location.pathname === link.href
                          ? "text-primary bg-primary/5"
                          : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                {/* CTA Button - Full width */}
                {!user && (
                  <div className="mt-5">
                    <Button variant="hero" className="w-full h-[54px] text-[17px] font-semibold" asChild>
                      <Link to="/inscription" onClick={() => setIsMobileOpen(false)}>
                        Rejoindre l'achat groupé
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Legal Links */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
