import { Link } from "react-router-dom";
import { Zap, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-10 pb-28 md:pb-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-1.5 font-bold text-base mb-3">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              Switchly
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comparateur d'électricité et gaz gratuit. Trouvez la meilleure offre en 30 secondes.
            </p>
          </div>

          {/* Comparer */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Comparer</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/electricite/" className="hover:text-foreground transition-colors">Électricité</Link></li>
              <li><Link to="/gaz/" className="hover:text-foreground transition-colors">Gaz naturel</Link></li>
              <li><Link to="/comparer" className="hover:text-foreground transition-colors">Élec + Gaz</Link></li>
            </ul>
          </div>

          {/* Infos */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Informations</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-foreground transition-colors">CGU</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
              <li><Link to="/politique-rgpd" className="hover:text-foreground transition-colors">RGPD</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Besoin d'aide ?</h4>
            <a href="tel:0973727300" className="flex items-center gap-2 text-primary font-semibold text-sm mb-1 hover:text-primary/80 transition-colors">
              <Phone className="w-4 h-4 flex-shrink-0" />
              09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground">Lun–Ven 7h–21h</p>
            <p className="text-xs text-muted-foreground">Sam 8h30–18h30</p>
            <p className="text-xs text-muted-foreground">Dim 9h–17h30</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Switchly</span>
          <span>Données : Enedis Open Data · CRE · geo.api.gouv.fr — Résultats non contractuels</span>
        </div>
      </div>
    </footer>
  );
}
