import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Switchly</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              L'achat groupé d'électricité et d'internet pour votre ville.
              Économisez ensemble.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/mentions-legales"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  to="/mentions-legales#rgpd"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Politique RGPD
                </Link>
              </li>
              <li>
                <Link
                  to="/mentions-legales#cgu"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  CGU
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                contact@switchly.fr
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                01 23 45 67 89
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Paris, France
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Switchly. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              100% français
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
