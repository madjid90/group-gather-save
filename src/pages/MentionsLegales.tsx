import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Informations légales</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Mentions légales
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-3xl p-8 border border-border shadow-switchly-lg prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. Éditeur du site
              </h2>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Switchly SAS</strong>
                <br />
                Capital social : 10 000€
                <br />
                Siège social : 123 Avenue de la République, 75011 Paris
                <br />
                RCS Paris : 123 456 789
                <br />
                N° TVA intracommunautaire : FR 12 345 678 901
                <br />
                Directeur de la publication : [Nom du directeur]
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. Hébergement
              </h2>
              <p className="text-muted-foreground">
                Le site est hébergé par :<br />
                <strong className="text-foreground">Lovable</strong>
                <br />
                Adresse : [Adresse hébergeur]
              </p>
            </section>

            <section className="mb-8" id="rgpd">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. Protection des données personnelles (RGPD)
              </h2>
              <p className="text-muted-foreground mb-4">
                Conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés, vous disposez d'un
                droit d'accès, de rectification, de suppression et de portabilité
                de vos données personnelles.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Données collectées
              </h3>
              <ul className="list-disc pl-5 text-muted-foreground mb-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Code postal et ville</li>
                <li>Préférences de contrats (électricité/internet)</li>
              </ul>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Finalités
              </h3>
              <p className="text-muted-foreground mb-4">
                Vos données sont collectées pour :
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mb-4">
                <li>Vous intégrer au groupement de votre ville</li>
                <li>Vous envoyer des offres négociées personnalisées</li>
                <li>Vous informer de l'avancement des négociations</li>
              </ul>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Conservation des données
              </h3>
              <p className="text-muted-foreground mb-4">
                Vos données sont conservées pendant 3 ans à compter de votre
                dernière activité sur notre plateforme.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Exercer vos droits
              </h3>
              <p className="text-muted-foreground">
                Pour exercer vos droits, contactez-nous à :{" "}
                <strong className="text-foreground">rgpd@switchly.fr</strong>
              </p>
            </section>

            <section className="mb-8" id="cgu">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Conditions Générales d'Utilisation (CGU)
              </h2>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Objet
              </h3>
              <p className="text-muted-foreground mb-4">
                Les présentes CGU régissent l'utilisation du site Switchly et
                des services proposés.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Inscription
              </h3>
              <p className="text-muted-foreground mb-4">
                L'inscription au groupement est gratuite et sans engagement.
                L'utilisateur s'engage à fournir des informations exactes.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Responsabilité
              </h3>
              <p className="text-muted-foreground mb-4">
                Switchly agit en tant qu'intermédiaire entre les utilisateurs et
                les fournisseurs d'énergie/internet. Les contrats de
                fourniture sont conclus directement entre l'utilisateur et le
                fournisseur.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Propriété intellectuelle
              </h3>
              <p className="text-muted-foreground">
                L'ensemble des éléments du site (textes, images, logos) sont
                protégés par le droit de la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Cookies
              </h2>
              <p className="text-muted-foreground">
                Le site utilise des cookies pour améliorer votre expérience. En
                continuant à naviguer, vous acceptez l'utilisation de cookies
                conformément à notre politique.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
