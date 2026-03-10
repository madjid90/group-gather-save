import { useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PolitiqueConfidentialite() {
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
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Confidentialité</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Politique de Confidentialité
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
                Notre engagement
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Chez Switchly, la protection de vos données personnelles est une priorité absolue. 
                Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Données collectées
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Identité</strong> : nom, prénom</li>
                <li><strong className="text-foreground">Contact</strong> : numéro de téléphone, email (optionnel)</li>
                <li><strong className="text-foreground">Localisation</strong> : ville, code postal</li>
                <li><strong className="text-foreground">Logement</strong> : type, surface, chauffage, isolation</li>
                <li><strong className="text-foreground">Contrats actuels</strong> : fournisseurs, tarifs, consommation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Utilisation des données
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li>Négocier des offres adaptées à votre profil</li>
                <li>Vous envoyer des communications par SMS</li>
                <li>Améliorer notre service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Protection et anonymisation
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Lorsque nous comparons les offres pour vous, vos données sont <strong className="text-foreground">totalement anonymisées</strong>. 
                Aucune information permettant de vous identifier n'est partagée : ni votre nom, ni votre téléphone, ni votre adresse.
                Seules les caractéristiques de votre logement et de vos contrats sont transmises pour vous présenter des offres adaptées.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Sécurité
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Nous utilisons des technologies de pointe pour sécuriser vos données :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Authentification sécurisée</li>
                <li>Surveillance continue des systèmes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Cookies
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Notre site utilise des cookies techniques essentiels au fonctionnement du service. 
                Nous n'utilisons pas de cookies publicitaires ni de trackers tiers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Vos droits
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Vous avez le droit de :
              </p>
              <ul className="list-disc pl-5 text-base text-muted-foreground space-y-2">
                <li>Accéder à vos données</li>
                <li>Les rectifier ou les supprimer</li>
                <li>Vous opposer à leur traitement</li>
                <li>Demander leur portabilité</li>
              </ul>
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                Pour exercer ces droits : <strong className="text-foreground">rgpd@switchly.fr</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Contact
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Pour toute question sur la confidentialité de vos données :<br />
                Email : <strong className="text-foreground">rgpd@switchly.fr</strong><br />
                Adresse : Switchly SAS, 123 Avenue de la République, 75011 Paris
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}