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
import { DynamicSEOHead } from "@/components/seo/DynamicSEOHead";

const faqItems = [
  {
    question: "Comment fonctionne le comparateur Switchly ?",
    answer: "Switchly est un comparateur gratuit d'énergie et d'internet. Entrez votre code postal, renseignez vos contrats actuels, et comparez en 30 secondes toutes les offres disponibles chez vous. Vous choisissez librement l'offre qui vous convient et souscrivez directement en ligne. Switchly est rémunéré par une commission versée par le fournisseur — vous ne payez jamais rien.",
  },
  {
    question: "La comparaison et la souscription sont-elles vraiment gratuites ?",
    answer: "Oui, 100% gratuit pour vous. Comparer ne vous coûte rien. Si vous souscrivez à une offre via Switchly, c'est le fournisseur qui nous verse une commission. Cette commission n'est pas répercutée sur votre tarif — vous bénéficiez du même prix qu'en souscrivant directement chez le fournisseur.",
  },
  {
    question: "Y a-t-il une coupure lors du changement de fournisseur ?",
    answer: "Non, aucune coupure. Le réseau de distribution (Enedis pour l'électricité, GRDF pour le gaz) ne change pas lors d'un changement de fournisseur. Seul votre contrat change. La transition est totalement transparente, souvent réalisée en 1 à 5 jours ouvrés sans que vous ayez quoi que ce soit à faire.",
  },
  {
    question: "Puis-je aussi comparer les offres internet ?",
    answer: "Oui. En plus de l'électricité et du gaz, Switchly compare les offres fibre et ADSL des principaux opérateurs : Orange, SFR, Bouygues Telecom, Free et RED. Selon votre éligibilité, vous pouvez économiser jusqu'à 16€/mois sur votre box, soit près de 200€/an. Combinez énergie et internet pour atteindre jusqu'à 400€/an d'économies.",
  },
  {
    question: "Que se passe-t-il si je ne veux pas changer de fournisseur ?",
    answer: "Rien du tout. La comparaison est sans engagement. Vous consultez les offres disponibles, et si aucune ne vous convient, vous gardez simplement votre contrat actuel. Aucun frais, aucune relance commerciale agressive.",
  },
  {
    question: "Je suis locataire, puis-je changer de fournisseur ?",
    answer: "Oui. Propriétaire ou locataire, vous êtes libre de choisir votre fournisseur d'énergie et d'internet. En tant que locataire, vous êtes généralement titulaire du contrat et pouvez donc le modifier librement. Aucune autorisation du propriétaire n'est nécessaire.",
  },
  {
    question: "Combien de temps prend la comparaison ?",
    answer: "La comparaison prend 30 secondes. Entrez votre code postal, sélectionnez le type de contrat, renseignez quelques informations sur votre logement — et vous voyez immédiatement toutes les offres disponibles, triées par économies. La souscription en ligne prend ensuite environ 5 minutes.",
  },
  {
    question: "Les offres présentées sont-elles fiables ?",
    answer: "Oui. Switchly référence uniquement des fournisseurs agréés par la CRE (Commission de Régulation de l'Énergie) en France. Les tarifs affichés sont exacts et mis à jour régulièrement. Vous connaissez le tarif exact avant de souscrire.",
  },
];

export default function FAQ() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition className="min-h-screen py-10 md:py-20 bg-gradient-subtle">
      <DynamicSEOHead 
        defaultTitle="FAQ - Switchly | Questions fréquentes sur le comparateur énergie et internet"
        defaultDescription="Toutes vos questions sur Switchly, comparateur gratuit d'électricité, gaz et internet. Fonctionnement, économies, fournisseurs partenaires."
      />
      <div className="container mx-auto px-5 sm:px-6">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Questions fréquentes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur Switchly
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-4 text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4 leading-relaxed">
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
                <Link to="/comparer">
                  Comparer gratuitement →
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
