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
    question: "C'est vraiment gratuit ?",
    answer:
      "Oui, 100% gratuit. Nous sommes rémunérés par les fournisseurs si vous acceptez une offre, sans aucun impact sur votre tarif.",
  },
  {
    question: "Suis-je obligé d'accepter ?",
    answer:
      "Non, vous êtes libre. Vous recevez une offre et vous décidez. Si elle ne convient pas, vous gardez votre contrat actuel.",
  },
  {
    question: "Combien puis-je économiser ?",
    answer:
      "En moyenne 312€/an. Les économies varient selon votre contrat actuel, mais peuvent atteindre 400€/an.",
  },
  {
    question: "Combien de temps prend l'inscription ?",
    answer:
      "30 secondes. Email + quelques infos sur votre logement. Offre reçue sous 48h.",
  },
  {
    question: "Quels fournisseurs ?",
    answer:
      "EDF, Engie, TotalEnergies... Uniquement des fournisseurs reconnus et fiables.",
  },
];

export function FAQSection() {
  return (
    <section className="py-10 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 lg:mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-6">
            Questions fréquentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-8 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-2 md:space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-lg md:rounded-xl px-4 md:px-6 data-[state=open]:bg-muted/50"
                >
                  <AccordionTrigger className="text-left text-sm md:text-lg font-medium hover:no-underline py-3 md:py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-lg text-muted-foreground pb-3 md:pb-5">
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
