import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowRight } from "lucide-react";

const faqItems = [
  {
    question: "Comment fonctionne l'achat groupé ?",
    answer:
      "L'achat groupé permet de négocier de meilleurs tarifs grâce au nombre. Plus il y a de participants dans votre ville, plus notre pouvoir de négociation augmente auprès des fournisseurs d'énergie et d'internet. Une fois le nombre de membres suffisant atteint, nous négocions les meilleures offres et vous les présentons.",
  },
  {
    question: "Est-ce vraiment gratuit et sans engagement ?",
    answer:
      "Oui, l'inscription au groupement est 100% gratuite. Vous n'êtes engagé à rien. Quand une offre négociée vous est proposée, vous êtes libre de l'accepter ou non. Nous ne prélevons aucun frais d'adhésion ou de souscription.",
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
      "Rien du tout ! Vous êtes libre de refuser l'offre sans aucune conséquence. Vous pouvez rester membre du groupement et attendre la prochaine campagne de négociation pour bénéficier d'une nouvelle offre.",
  },
  {
    question: "Comment puis-je résilier mon contrat actuel ?",
    answer:
      "Dans la plupart des cas, le nouveau fournisseur s'occupe de toutes les démarches de résiliation pour vous. Vous n'avez rien à faire. Si vous êtes engagé, nous vous informerons des éventuels frais de résiliation avant toute souscription.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. Nous utilisons les dernières technologies de sécurité pour protéger vos données. Vos informations ne sont jamais partagées avec des tiers à des fins commerciales. Nous respectons strictement le RGPD.",
  },
  {
    question: "Puis-je participer si je suis locataire ?",
    answer:
      "Oui, tout à fait ! Que vous soyez propriétaire ou locataire, vous pouvez rejoindre le groupement et bénéficier des offres négociées pour vos contrats d'électricité et d'internet.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Questions fréquentes</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            FAQ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur Switchly et l'achat groupé
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Vous avez d'autres questions ?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/inscription">
                  Rejoindre le groupement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
