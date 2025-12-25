import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function CGU() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-6 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Conditions d'utilisation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Conditions Générales d'Utilisation
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-switchly space-y-6">
            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                1. Objet
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service Switchly, plateforme d'achat groupé d'énergie et d'internet.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                2. Description du service
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switchly est un service gratuit qui permet aux utilisateurs de bénéficier de tarifs négociés collectivement auprès de fournisseurs d'énergie et d'internet. 
                Switchly agit en tant qu'intermédiaire entre les utilisateurs et les fournisseurs.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                3. Inscription et compte
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                L'inscription au service est gratuite et sans engagement. Pour vous inscrire, vous devez :
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Être majeur et capable juridiquement</li>
                <li>Fournir des informations exactes et à jour</li>
                <li>Disposer d'un numéro de téléphone français valide</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                4. Fonctionnement
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Le service fonctionne par campagnes trimestrielles :
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li><strong className="text-foreground">Phase d'inscription</strong> : vous vous inscrivez et complétez votre profil</li>
                <li><strong className="text-foreground">Phase de négociation</strong> : nous négocions avec les fournisseurs en votre nom</li>
                <li><strong className="text-foreground">Phase d'offre</strong> : vous recevez une offre personnalisée par SMS</li>
                <li><strong className="text-foreground">Choix libre</strong> : vous acceptez ou refusez l'offre sans obligation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                5. Engagements de l'utilisateur
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                En utilisant Switchly, vous vous engagez à :
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Fournir des informations véridiques sur votre situation</li>
                <li>Ne pas utiliser le service à des fins frauduleuses</li>
                <li>Respecter les présentes CGU</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                6. Responsabilité
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switchly s'engage à négocier les meilleures offres possibles mais ne garantit pas un niveau d'économies spécifique. 
                Les offres présentées sont indicatives et peuvent varier selon votre situation réelle.
                Switchly n'est pas responsable des services fournis directement par les fournisseurs d'énergie ou d'internet.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                7. Propriété intellectuelle
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                L'ensemble des éléments du site (textes, logos, images, graphismes) sont la propriété exclusive de Switchly SAS. 
                Toute reproduction ou utilisation sans autorisation est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                8. Modification des CGU
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switchly se réserve le droit de modifier les présentes CGU à tout moment. 
                Les utilisateurs seront informés de toute modification substantielle.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                9. Résiliation
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vous pouvez supprimer votre compte à tout moment en contactant notre support. 
                Switchly peut suspendre ou supprimer un compte en cas de non-respect des CGU.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                10. Droit applicable
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Les présentes CGU sont soumises au droit français. 
                En cas de litige, les tribunaux de Paris seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">
                11. Contact
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pour toute question concernant ces CGU, contactez-nous à : <strong className="text-foreground">contact@switchly.fr</strong>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
