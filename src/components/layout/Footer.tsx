import { Link } from "react-router-dom";
import { Zap, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 pb-20 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-1.5 font-bold text-lg mb-3">
              <Zap className="w-5 h-5 text-primary" />
              Switchly
            </Link>
            <p className="text-sm text-muted-foreground">
              Comparateur d'électricité et gaz gratuit. Trouvez la meilleure offre en 30 secondes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Comparer</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/comparer?type=electricite" className="hover:text-foreground transition-colors">Électricité</Link></li>
              <li><Link to="/comparer?type=gaz" className="hover:text-foreground transition-colors">Gaz naturel</Link></li>
              <li><Link to="/comparer?type=les_deux" className="hover:text-foreground transition-colors">Élec + Gaz</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Informations</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-foreground transition-colors">CGU</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Besoin d'aide ?</h4>
            <a href="tel:0973727300" className="flex items-center gap-2 text-primary font-semibold mb-1">
              <Phone className="w-4 h-4" />
              09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground">Lun-Ven 7h-21h · Sam 8h30-18h30</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Switchly · Données : Enedis Open Data, CRE, geo.api.gouv.fr · Résultats non contractuels
        </div>
      </div>
    </footer>
  );
}
