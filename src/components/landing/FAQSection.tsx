import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    question: "Y a-t-il une coupure lors du changement ?",
    answer: "Aucune coupure. Le réseau de distribution (Enedis pour l'électricité, GRDF pour le gaz) ne change pas. Seul votre fournisseur change. La transition est transparente et se fait en quelques jours ouvrés.",
  },
  {
    question: "Je suis locataire, puis-je changer ?",
    answer: "Oui. Propriétaire ou locataire, vous êtes libre de choisir votre fournisseur d'énergie. Le changement se fait sans intervention du propriétaire et sans modification du logement.",
  },
  {
    question: "Combien de temps prend la souscription ?",
    answer: "La comparaison prend 30 secondes. La souscription en ligne prend 5 minutes supplémentaires. Le changement de fournisseur est effectif sous 1 à 21 jours ouvrés.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-20 bg-card">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="inline-block text-primary font-semibold text-xs uppercase tracking-widest mb-3">FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Questions fréquentes</h2>
          <p className="text-base text-muted-foreground">Tout ce que vous devez savoir sur Switchly.</p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-background border border-border rounded-xl px-4 data-[state=open]:bg-muted/40 transition-colors"
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
      </div>
    </section>
  );
}
