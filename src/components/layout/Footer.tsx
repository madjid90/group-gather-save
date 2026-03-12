import { Link } from "react-router-dom";
import { Zap, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="orb orb-blue w-[300px] h-[300px] -bottom-40 -left-20 opacity-20" />
      <div className="orb orb-green w-[200px] h-[200px] -bottom-20 right-10 opacity-15" />
      
      <div className="relative z-10 py-14 pb-24 md:pb-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-white">Switchly</span>
              </Link>
              <p className="text-sm text-white/50 leading-relaxed">
                Comparateur d'électricité et gaz gratuit. Trouvez la meilleure offre en 30 secondes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Comparer</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/comparer?type=electricite" className="text-white/50 hover:text-white transition-colors">Électricité</Link></li>
                <li><Link to="/comparer?type=gaz" className="text-white/50 hover:text-white transition-colors">Gaz naturel</Link></li>
                <li><Link to="/comparer?type=les_deux" className="text-white/50 hover:text-white transition-colors">Élec + Gaz</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Informations</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/faq" className="text-white/50 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="text-white/50 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/mentions-legales" className="text-white/50 hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link to="/cgu" className="text-white/50 hover:text-white transition-colors">CGU</Link></li>
                <li><Link to="/politique-confidentialite" className="text-white/50 hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link to="/politique-rgpd" className="text-white/50 hover:text-white transition-colors">Politique RGPD</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white/80 mb-4 uppercase tracking-wider">Besoin d'aide ?</h4>
              <a href="tel:0973727300" className="inline-flex items-center gap-2 text-white font-semibold mb-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-secondary" />
                </div>
                09 73 72 73 00
              </a>
              <p className="text-xs text-white/40">Lun-Ven 7h-21h · Sam 8h30-18h30</p>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-white/30">
            © {new Date().getFullYear()} Switchly · Données : Enedis Open Data, CRE, geo.api.gouv.fr · Résultats non contractuels
          </div>
        </div>
      </div>
    </footer>
  );
}
