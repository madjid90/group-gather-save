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
    question: "Comment économiser sur mes factures d'énergie et d'internet ?",
    answer: "Grâce à l'achat groupé, nous négocions des tarifs préférentiels auprès de fournisseurs reconnus. Nos membres économisent en moyenne 312€/an sur leurs factures d'électricité, gaz et internet.",
  },
  {
    question: "L'inscription est-elle vraiment gratuite ?",
    answer: "Oui, 100% gratuite et sans engagement. Vous recevez une offre par SMS et décidez librement.",
  },
  {
    question: "Puis-je aussi économiser sur ma box internet ?",
    answer: "Oui ! Économisez jusqu'à 16€/mois sur votre abonnement internet grâce à nos négociations groupées.",
  },
  {
    question: "Quels sont les fournisseurs partenaires ?",
    answer: "EDF, Engie, TotalEnergies, Orange, SFR, Bouygues, Free. Uniquement des acteurs majeurs de confiance.",
  },
  {
    question: "Comment fonctionne la démarche 100% digitale ?",
    answer: "Tout par SMS et en ligne. Aucun démarchage téléphonique, aucun commercial ne vous appellera.",
  },
];

export function FAQSection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
            Questions fréquentes
          </h2>
          <p className="text-[13px] leading-relaxed lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur l'achat groupé Switchly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-8 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-1.5 md:space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-md md:rounded-xl px-3 md:px-6 data-[state=open]:bg-muted/50"
                >
                  <AccordionTrigger className="text-left text-xs md:text-lg font-medium hover:no-underline py-2.5 md:py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs md:text-lg text-muted-foreground pb-2.5 md:pb-5">
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
