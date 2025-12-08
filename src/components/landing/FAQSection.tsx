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
      "Oui, l'inscription est 100 % gratuite. Vous ne payez rien pour participer à l'achat groupé.",
  },
  {
    question: "Suis-je engagé si je m'inscris ?",
    answer:
      "Non. Vous recevez une offre négociée et vous choisissez de l'accepter ou non.",
  },
  {
    question: "Comment gagnez-vous de l'argent ?",
    answer:
      "Nous pouvons être rémunérés par certains partenaires si une offre est acceptée, jamais en augmentant votre tarif.",
  },
  {
    question: "Quelles économies puis-je espérer ?",
    answer:
      "Cela dépend de votre situation actuelle, mais l'objectif est de réduire au maximum votre facture annuelle.",
  },
];

export function FAQSection() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 md:mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Questions fréquentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Questions fréquentes
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
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
          <div className="bg-card rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-4 md:px-6 data-[state=open]:bg-muted/50"
                >
                  <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-3 md:py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground pb-3 md:pb-4">
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
