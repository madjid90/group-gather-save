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
    question: "Est-ce vraiment gratuit ?",
    answer:
      "Oui, l'inscription est totalement gratuite et sans engagement.",
  },
  {
    question: "Suis-je obligé d'accepter l'offre ?",
    answer:
      "Non. Vous décidez librement d'accepter ou non l'offre négociée.",
  },
  {
    question: "Comment Switchly se rémunère ?",
    answer:
      "Certains fournisseurs peuvent nous rémunérer si vous acceptez une offre, sans impact sur votre tarif.",
  },
  {
    question: "Quelles économies puis-je espérer ?",
    answer:
      "Cela dépend de votre contrat actuel, mais l'objectif est de réduire au maximum vos factures d'énergie et d'internet.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-5 md:mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Questions fréquentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Questions fréquentes
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Les réponses à vos questions sur l'achat groupé
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-10 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-4 md:space-y-5">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-5 md:px-6 data-[state=open]:bg-muted/50"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:no-underline py-4 md:py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg text-muted-foreground pb-4 md:pb-5">
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
