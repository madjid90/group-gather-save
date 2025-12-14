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
      "Oui, l'inscription à l'achat groupé énergie et internet est totalement gratuite et sans engagement.",
  },
  {
    question: "Suis-je obligé d'accepter l'offre ?",
    answer:
      "Non. Vous décidez librement d'accepter ou de refuser l'offre négociée. Aucune obligation.",
  },
  {
    question: "Comment Switchly se rémunère ?",
    answer:
      "Certains fournisseurs d'énergie ou d'internet peuvent nous rémunérer si vous acceptez une offre, sans aucun impact sur votre tarif.",
  },
  {
    question: "Quelles économies puis-je espérer ?",
    answer:
      "Grâce à l'achat groupé d'électricité et d'internet, nos membres peuvent réduire leur facture jusqu'à 400 € par an selon leur contrat actuel.",
  },
  {
    question: "Switchly est-il un comparateur d'énergie ?",
    answer:
      "Non. Switchly organise des achats groupés d'énergie et d'internet pour négocier des tarifs collectifs. Nous ne comparons pas l'ensemble du marché.",
  },
];

export function FAQSection() {
  return (
    <section className="py-8 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary mb-3 md:mb-6">
            <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">Questions fréquentes</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-6">
            Questions fréquentes
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            <span className="hidden md:inline">Les réponses à vos questions sur l'achat groupé</span>
            <span className="md:hidden">Vos questions, nos réponses</span>
          </p>
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
