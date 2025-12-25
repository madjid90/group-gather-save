import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function MentionsLegales() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-6 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Informations légales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Mentions légales
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-switchly">
            <section className="mb-6">
              <h2 className="text-base font-bold text-foreground mb-3">
                1. Éditeur du site
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Switchly SAS</strong>
                <br />
                Capital social : 10 000€
                <br />
                Siège social : 123 Avenue de la République, 75011 Paris
                <br />
                RCS Paris : 123 456 789
                <br />
                N° TVA intracommunautaire : FR 12 345 678 901
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-base font-bold text-foreground mb-3">
                2. Hébergement
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Le site est hébergé par :<br />
                <strong className="text-foreground">Lovable</strong>
              </p>
            </section>

            <section className="mb-6" id="rgpd">
              <h2 className="text-base font-bold text-foreground mb-3">
                3. Protection des données (RGPD)
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un
                droit d'accès, de rectification, de suppression et de portabilité de vos données.
              </p>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Données collectées
              </h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground mb-3 space-y-1">
                <li>Nom et prénom</li>
                <li>Numéro de téléphone</li>
                <li>Informations sur le logement</li>
              </ul>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Exercer vos droits
              </h3>
              <p className="text-sm text-muted-foreground">
                Contact : <strong className="text-foreground">rgpd@switchly.fr</strong>
              </p>
            </section>

            <section className="mb-6" id="cgu">
              <h2 className="text-base font-bold text-foreground mb-3">
                4. Conditions Générales d'Utilisation
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                L'inscription au groupement est gratuite et sans engagement.
                Switchly agit en tant qu'intermédiaire entre les utilisateurs et les fournisseurs.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                5. Cookies
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Le site utilise des cookies pour améliorer votre expérience.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
