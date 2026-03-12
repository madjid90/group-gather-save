import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto px-4">
          <nav className="glass-strong rounded-none sm:rounded-b-2xl mx-auto max-w-5xl sm:mt-0">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-foreground">Switchly</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {[
                  { to: "/electricite/", label: "Électricité" },
                  { to: "/gaz/", label: "Gaz" },
                  { to: "/faq", label: "FAQ" },
                  { to: "/contact", label: "Contact" },
                ].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button variant="hero" size="sm" className="ml-2" asChild>
                  <Link to="/comparer">
                    Comparer <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              <button
                onClick={() => setOpen(!open)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mx-4 mt-1"
            >
              <div className="glass-strong rounded-2xl p-3 space-y-1 shadow-lg">
                {[
                  { to: "/electricite/", label: "⚡ Électricité" },
                  { to: "/gaz/", label: "🔥 Gaz" },
                  { to: "/faq", label: "❓ FAQ" },
                  { to: "/contact", label: "✉️ Contact" },
                ].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block py-3 px-4 text-sm font-medium rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-1">
                  <Button variant="hero" size="lg" className="w-full" asChild onClick={() => setOpen(false)}>
                    <Link to="/comparer">
                      Comparer gratuitement <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
