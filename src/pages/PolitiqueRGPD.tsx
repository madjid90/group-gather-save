import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PolitiqueRGPD() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-10 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-5 sm:px-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Protection des données</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Politique RGPD
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-switchly-lg space-y-8">
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                1. Responsable du traitement
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Switchly SAS</strong> est responsable du traitement des données personnelles collectées sur ce site.
                <br />
                Contact : <strong className="text-foreground">rgpd@switchly.fr</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                2. Données collectées
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Nous collectons uniquement les données nécessaires à notre service :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li>Nom et prénom</li>
                <li>Numéro de téléphone</li>
                <li>Adresse email (optionnelle)</li>
                <li>Ville et code postal</li>
                <li>Informations sur le logement (type, surface, chauffage)</li>
                <li>Informations sur les contrats actuels (fournisseur, tarif)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                3. Finalités du traitement
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li>Négocier des offres groupées avec les fournisseurs d'énergie et d'internet</li>
                <li>Vous envoyer votre offre personnalisée par SMS</li>
                <li>Vous informer sur l'avancement des négociations</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                4. Base légale
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Le traitement de vos données est basé sur votre <strong className="text-foreground">consentement</strong> donné lors de votre inscription.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                5. Partage des données
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Vos données sont partagées de manière <strong className="text-foreground">anonymisée</strong> avec les fournisseurs d'énergie et d'internet pour la négociation des offres. 
                Aucune information permettant de vous identifier (nom, téléphone, email) n'est transmise aux fournisseurs.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                6. Durée de conservation
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Vos données sont conservées pendant 3 ans après votre dernière activité sur la plateforme, ou jusqu'à votre demande de suppression.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                7. Vos droits
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong className="text-foreground">Droit de rectification</strong> : corriger vos données</li>
                <li><strong className="text-foreground">Droit à l'effacement</strong> : supprimer vos données</li>
                <li><strong className="text-foreground">Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong className="text-foreground">Droit d'opposition</strong> : vous opposer au traitement</li>
                <li><strong className="text-foreground">Droit de retirer votre consentement</strong> à tout moment</li>
              </ul>
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                Pour exercer vos droits, contactez-nous à : <strong className="text-foreground">rgpd@switchly.fr</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                8. Sécurité
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                9. Réclamation
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Vous pouvez introduire une réclamation auprès de la <strong className="text-foreground">CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}