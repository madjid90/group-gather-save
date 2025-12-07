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
    question: "Comment fonctionne l'achat groupé ?",
    answer:
      "L'achat groupé permet de négocier de meilleurs tarifs grâce au nombre. Plus il y a de participants, plus notre pouvoir de négociation augmente auprès des fournisseurs d'énergie et d'internet. Une fois le nombre de membres suffisant atteint, nous négocions les meilleures offres et vous les présentons.",
  },
  {
    question: "Est-ce vraiment gratuit et sans engagement ?",
    answer:
      "Oui, l'inscription est 100% gratuite. Vous n'êtes engagé à rien. Quand une offre négociée vous est proposée, vous êtes libre de l'accepter ou non. Nous ne prélevons aucun frais d'adhésion ou de souscription.",
  },
  {
    question: "Combien puis-je économiser ?",
    answer:
      "Les économies varient selon le nombre de participants et les offres négociées. En moyenne, nos membres économisent entre 150€ et 400€ par an en combinant électricité et internet. Plus le groupement est important, plus les réductions sont avantageuses.",
  },
  {
    question: "Comment êtes-vous rémunérés ?",
    answer:
      "Nous percevons une commission de la part des fournisseurs lorsque vous souscrivez à une offre. Cette commission n'impacte pas le prix que vous payez - au contraire, les tarifs négociés sont inférieurs aux tarifs publics.",
  },
  {
    question: "Que se passe-t-il si je refuse l'offre proposée ?",
    answer:
      "Rien du tout ! Vous êtes libre de refuser l'offre sans aucune conséquence. Vous pouvez rester membre et attendre la prochaine campagne de négociation pour bénéficier d'une nouvelle offre.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. Nous utilisons les dernières technologies de sécurité pour protéger vos données. Vos informations ne sont jamais partagées avec des tiers à des fins commerciales. Nous respectons strictement le RGPD.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Questions fréquentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tout savoir sur Switchly
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-switchly-lg">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-6 data-[state=open]:bg-muted/50"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
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
