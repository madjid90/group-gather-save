import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const faqItems = [
  {
    question: "Comment fonctionne l'achat groupé pour économiser sur l'électricité et le gaz ?",
    answer:
      "L'achat groupé est un principe simple et efficace : plus nous sommes nombreux à nous regrouper, plus notre pouvoir de négociation augmente face aux fournisseurs d'énergie. Concrètement, nous rassemblons des milliers de foyers français souhaitant réduire leurs factures d'électricité et de gaz. Grâce à ce volume, nous négocions directement avec EDF, Engie, TotalEnergies et d'autres fournisseurs pour obtenir des tarifs préférentiels impossibles à obtenir seul. Une fois les négociations terminées, vous recevez une offre personnalisée par SMS que vous êtes libre d'accepter ou de refuser.",
  },
  {
    question: "L'inscription est-elle vraiment 100% gratuite et sans engagement ?",
    answer:
      "Oui, l'inscription est totalement gratuite et vous n'êtes engagé à rien. Vous pouvez vous inscrire en 30 secondes, recevoir votre offre personnalisée, et décider librement de l'accepter ou non. Si l'offre ne vous convient pas, vous ne payez rien et gardez votre contrat actuel sans aucune pénalité. Notre rémunération provient uniquement d'une commission versée par les fournisseurs lorsque vous acceptez une offre - cette commission n'impacte pas le tarif que vous payez, qui reste inférieur aux tarifs publics.",
  },
  {
    question: "Combien puis-je réellement économiser sur mes factures d'énergie ?",
    answer:
      "Les économies varient selon votre situation actuelle et votre consommation, mais nos membres économisent en moyenne 312€ par an sur leurs factures d'électricité et de gaz. Certains foyers avec une consommation élevée (chauffage électrique, grande surface) peuvent atteindre jusqu'à 400€ d'économies annuelles. Nous vous fournissons une estimation personnalisée avant toute souscription pour que vous puissiez prendre une décision éclairée.",
  },
  {
    question: "Puis-je aussi économiser sur mon abonnement box internet ?",
    answer:
      "Absolument ! En plus de l'énergie, nous négocions également des offres internet avantageuses avec les principaux opérateurs : Orange, SFR, Bouygues Telecom et Free. Que vous soyez en fibre optique ou en ADSL, nos membres économisent jusqu'à 16€ par mois sur leur abonnement internet, soit près de 200€ par an. Vous pouvez combiner les offres énergie et internet pour maximiser vos économies et atteindre plus de 400€ d'économies annuelles.",
  },
  {
    question: "Quels sont les fournisseurs partenaires et sont-ils fiables ?",
    answer:
      "Nous travaillons exclusivement avec des fournisseurs reconnus et établis sur le marché français. Pour l'énergie : EDF (fournisseur historique), Engie, TotalEnergies, et d'autres acteurs majeurs. Pour internet : Orange, SFR, Bouygues Telecom et Free. Tous ces fournisseurs sont des entreprises de confiance, présentes depuis des années sur le marché français. Nous ne travaillons jamais avec des fournisseurs inconnus ou des offres douteuses.",
  },
  {
    question: "Comment fonctionne la démarche 100% digitale par SMS ?",
    answer:
      "Notre processus est entièrement digital pour votre confort : inscription en 30 secondes sur notre site, réception de votre offre personnalisée par SMS sous 24 à 48h, consultation détaillée sur votre espace client sécurisé, et acceptation en un clic si l'offre vous convient. Aucun démarchage téléphonique, aucun commercial ne vous appellera jamais. Vous gardez le contrôle total et décidez à votre rythme, sans pression.",
  },
  {
    question: "Que se passe-t-il si je refuse l'offre proposée ?",
    answer:
      "Absolument rien ! Vous êtes 100% libre de refuser l'offre sans aucune conséquence ni frais. Vous conservez simplement votre contrat actuel. Vous pouvez rester inscrit et attendre la prochaine campagne de négociation pour bénéficier d'une nouvelle offre potentiellement encore plus avantageuse. Il n'y a aucune pression, aucune relance commerciale agressive.",
  },
  {
    question: "Qui s'occupe des démarches de changement de fournisseur ?",
    answer:
      "Si vous acceptez l'offre, nous nous occupons de tout ! Nous transmettons votre dossier au nouveau fournisseur qui prend en charge l'intégralité des démarches administratives, y compris la résiliation de votre ancien contrat. La transition se fait sans coupure d'électricité, de gaz ou d'internet, et sans intervention de votre part. Vous n'avez littéralement rien à faire, si ce n'est profiter de vos économies.",
  },
  {
    question: "Mes données personnelles sont-elles sécurisées ?",
    answer:
      "La sécurité de vos données est notre priorité absolue. Switchly est une plateforme 100% française, hébergée en France, et conforme au RGPD (Règlement Général sur la Protection des Données). Vos informations personnelles sont chiffrées et ne sont jamais revendues à des tiers. Nous les utilisons uniquement pour vous proposer des offres personnalisées et gérer votre dossier auprès des fournisseurs partenaires.",
  },
  {
    question: "Puis-je participer si je suis locataire ?",
    answer:
      "Oui, que vous soyez propriétaire ou locataire, vous pouvez rejoindre l'achat groupé et bénéficier des offres négociées. En tant que locataire, vous êtes généralement titulaire du contrat d'électricité, de gaz et d'internet de votre logement, et vous pouvez donc librement changer de fournisseur pour profiter de tarifs plus avantageux.",
  },
  {
    question: "Combien de temps faut-il pour recevoir mon offre personnalisée ?",
    answer:
      "Après votre inscription (30 secondes), vous recevez votre offre personnalisée par SMS sous 24 à 48 heures. Cette offre tient compte de votre situation actuelle et de votre consommation pour vous proposer le tarif le plus avantageux. Vous pouvez ensuite la consulter en détail sur votre espace client et prendre votre décision en toute tranquillité, sans limite de temps.",
  },
  {
    question: "L'achat groupé est-il vraiment fiable ?",
    answer:
      "Oui, l'achat groupé est un modèle éprouvé utilisé depuis des années dans de nombreux secteurs. Des milliers de foyers français ont déjà économisé grâce à Switchly. Notre transparence est totale : vous connaissez le tarif exact avant d'accepter, vous savez avec quel fournisseur vous signez, et vous pouvez refuser sans conséquence. Les témoignages de nos membres attestent de la fiabilité de notre service.",
  },
];

export default function FAQ() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition className="min-h-screen py-10 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-5 sm:px-6">
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
          className="text-center mb-6 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-3">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Questions fréquentes</span>
          </div>
          <h1 className="text-[20px] sm:text-2xl font-bold text-foreground mb-1">
            FAQ
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Tout savoir sur Switchly et l'achat groupé
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-xl p-4 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-3 text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 md:mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez d'autres questions ?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="py-3 text-sm" 
                asChild
              >
                <Link to="/contact">Nous contacter</Link>
              </Button>
              <Button 
                variant="hero" 
                size="lg"
                className="py-3 text-sm" 
                asChild
              >
                <Link to="/inscription">
                  Rejoindre l'achat groupé gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
