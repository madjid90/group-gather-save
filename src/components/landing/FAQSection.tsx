import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "Comment fonctionne Switchly ?",
    answer: "Switchly est un comparateur gratuit d'électricité et de gaz. Entrez votre code postal, indiquez votre consommation, et comparez en 30 secondes toutes les offres disponibles chez vous. Vous choisissez librement l'offre qui vous convient et souscrivez directement. Switchly est rémunéré par une commission du fournisseur — jamais par vous.",
  },
  {
    question: "La comparaison est-elle vraiment gratuite ?",
    answer: "Oui, 100% gratuit. Comparer ne vous coûte rien. Si vous souscrivez à une offre, c'est le fournisseur qui verse une commission à Switchly. Cette commission n'impacte pas votre tarif, qui reste le meilleur disponible sur le marché.",
  },
  {
    question: "Y a-t-il une coupure lors du changement de fournisseur ?",
    answer: "Aucune coupure. Le réseau de distribution (Enedis pour l'électricité, GRDF pour le gaz) ne change pas. Seul votre fournisseur change. La transition est transparente et se fait en quelques jours ouvrés.",
  },
  {
    question: "Je suis locataire, puis-je changer de fournisseur ?",
    answer: "Oui. Propriétaire ou locataire, vous êtes libre de choisir votre fournisseur d'énergie. Le changement se fait sans intervention du propriétaire et sans modification du logement.",
  },
  {
    question: "Combien de temps prend la souscription ?",
    answer: "La comparaison prend 30 secondes. La souscription en ligne prend 5 minutes supplémentaires. Le changement de fournisseur est ensuite effectif sous 1 à 5 jours ouvrés.",
  },
];

export function FAQSection() {
  return (
    <section className="py-section-mobile lg:py-section-desktop bg-background">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Questions fréquentes
          </h2>
          <p className="text-sm lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur Switchly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 border border-border/60 shadow-sm">
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border/50 rounded-xl px-4 md:px-6 data-[state=open]:bg-muted/30 data-[state=open]:border-primary/20 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm md:text-base font-semibold hover:no-underline py-4 md:py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4 md:pb-5 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
