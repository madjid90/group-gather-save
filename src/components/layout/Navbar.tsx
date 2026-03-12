import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 font-bold text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Switchly
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/electricite/" className="text-muted-foreground hover:text-foreground transition-colors">Électricité</Link>
            <Link to="/gaz/" className="text-muted-foreground hover:text-foreground transition-colors">Gaz</Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Button size="sm" asChild>
              <Link to="/comparer">Comparer gratuitement →</Link>
            </Button>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
            <Link to="/electricite/" onClick={() => setOpen(false)} className="block py-2 text-sm">⚡ Électricité</Link>
            <Link to="/gaz/" onClick={() => setOpen(false)} className="block py-2 text-sm">🔥 Gaz</Link>
            <Link to="/faq" onClick={() => setOpen(false)} className="block py-2 text-sm">FAQ</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2 text-sm">Contact</Link>
          </div>
        )}
      </header>
    </>
  );
}
