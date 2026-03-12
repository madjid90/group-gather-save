import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: "/electricite/", label: "Électricité" },
    { to: "/gaz/",         label: "Gaz" },
    { to: "/faq",          label: "FAQ" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled || open
            ? "bg-background border-b border-border shadow-sm"
            : "bg-background/95 backdrop-blur border-b border-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between max-w-5xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 font-bold text-base" aria-label="Switchly — Accueil">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span>Switchly</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(l.to.replace(/\/$/, ""))
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:0973727300"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="font-medium">09 73 72 73 00</span>
            </a>
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-semibold" asChild>
              <Link to="/comparer">Comparer gratuitement →</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2 space-y-2">
              <a
                href="tel:0973727300"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="w-4 h-4" />
                09 73 72 73 00 — Conseiller gratuit
              </a>
              <Button
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold h-11"
                asChild
              >
                <Link to="/comparer">Comparer gratuitement →</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-14" aria-hidden="true" />
    </>
  );
}
