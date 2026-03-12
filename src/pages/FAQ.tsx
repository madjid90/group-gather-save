import { useEffect } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft, Phone } from "lucide-react";
import { Helmet } from "react-helmet-async";

const faqItems = [
  {
    question: "Comment fonctionne le comparateur Switchly ?",
    answer: "Switchly est un comparateur gratuit d'électricité et de gaz. Entrez votre code postal, renseignez quelques informations sur votre logement, et comparez en 30 secondes toutes les offres disponibles chez vous. Vous choisissez librement l'offre qui vous convient et souscrivez directement en ligne. Switchly est rémunéré par une commission versée par le fournisseur — vous ne payez jamais rien.",
  },
  {
    question: "La comparaison et la souscription sont-elles vraiment gratuites ?",
    answer: "Oui, 100% gratuit pour vous. Comparer ne vous coûte rien. Si vous souscrivez à une offre via Switchly, c'est le fournisseur qui nous verse une commission. Cette commission n'est pas répercutée sur votre tarif — vous bénéficiez du même prix qu'en souscrivant directement chez le fournisseur.",
  },
  {
    question: "Y a-t-il une coupure lors du changement de fournisseur ?",
    answer: "Non, aucune coupure. Le réseau de distribution (Enedis pour l'électricité, GRDF pour le gaz) ne change pas lors d'un changement de fournisseur. Seul votre contrat change. La transition est totalement transparente, souvent réalisée en 1 à 21 jours ouvrés.",
  },
  {
    question: "Que se passe-t-il si je ne veux pas changer de fournisseur ?",
    answer: "Rien du tout. La comparaison est sans engagement. Vous consultez les offres disponibles, et si aucune ne vous convient, vous gardez simplement votre contrat actuel. Aucun frais, aucune relance.",
  },
  {
    question: "Je suis locataire, puis-je changer de fournisseur ?",
    answer: "Oui. Propriétaire ou locataire, vous êtes libre de choisir votre fournisseur d'énergie. Aucune autorisation du propriétaire n'est nécessaire.",
  },
  {
    question: "Combien de temps prend la comparaison ?",
    answer: "La comparaison prend 30 secondes. La souscription en ligne prend ensuite environ 5 minutes. Le changement de fournisseur est effectif sous 1 à 21 jours ouvrés.",
  },
  {
    question: "Les offres présentées sont-elles fiables ?",
    answer: "Oui. Switchly référence uniquement des fournisseurs agréés par la CRE (Commission de Régulation de l'Énergie) en France. Les tarifs affichés sont mis à jour régulièrement. Vous connaissez le prix exact avant de souscrire.",
  },
];

export default function FAQ() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>FAQ — Switchly | Questions fréquentes sur le comparateur énergie</title>
        <meta name="description" content="Toutes vos questions sur Switchly, comparateur gratuit d'électricité et de gaz. Fonctionnement, économies, fournisseurs partenaires." />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 max-w-2xl py-10 md:py-16">

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Questions fréquentes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Questions fréquentes
            </h1>
            <p className="text-base text-muted-foreground">
              Tout ce que vous devez savoir sur Switchly.
            </p>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-card border border-border rounded-xl px-4 data-[state=open]:bg-muted/40 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4 text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* CTA bas */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 bg-card border border-border rounded-2xl p-6 text-center"
          >
            <p className="font-semibold text-base mb-1">Vous avez une autre question ?</p>
            <p className="text-sm text-muted-foreground mb-4">Contactez-nous ou comparez directement.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="lg" className="h-11" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
              <Button size="lg" className="h-11 bg-secondary hover:bg-secondary/90 text-white font-bold" asChild>
                <Link to="/comparer">Comparer gratuitement →</Link>
              </Button>
            </div>
          </motion.div>

          {/* Téléphone */}
          <div className="mt-5 text-center">
            <a href="tel:0973727300" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              <Phone className="w-4 h-4" /> 09 73 72 73 00
            </a>
            <p className="text-xs text-muted-foreground mt-1">Lun–Ven 7h–21h · Sam 8h30–18h30</p>
          </div>
        </div>
      </div>
    </>
  );
}
