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
    question: "Comment économiser sur ma facture d'électricité et de gaz ?",
    answer:
      "Grâce à l'achat groupé, nous négocions des tarifs préférentiels auprès des fournisseurs d'énergie. Plus nous sommes nombreux, plus les prix baissent. Nos membres économisent en moyenne 312€/an sur leurs factures d'électricité et de gaz.",
  },
  {
    question: "L'inscription est-elle vraiment gratuite et sans engagement ?",
    answer:
      "Oui, l'inscription est 100% gratuite et sans aucun engagement. Vous recevez une offre personnalisée par SMS et vous êtes libre d'accepter ou de refuser. Si l'offre ne vous convient pas, vous ne payez rien et gardez votre contrat actuel.",
  },
  {
    question: "Puis-je aussi économiser sur ma box internet ?",
    answer:
      "Absolument ! Nous négocions également des offres internet (fibre, ADSL) avec les opérateurs. Nos membres économisent jusqu'à 16€/mois sur leur abonnement internet, soit près de 200€/an.",
  },
  {
    question: "Quels sont les fournisseurs partenaires de confiance ?",
    answer:
      "Nous travaillons uniquement avec des fournisseurs reconnus et fiables : EDF, Engie, TotalEnergies pour l'énergie, et Orange, SFR, Bouygues, Free pour internet. Tous sont des acteurs majeurs du marché français.",
  },
  {
    question: "Comment fonctionne la démarche 100% digitale ?",
    answer:
      "Tout se fait en ligne et par SMS : inscription en 30 secondes, réception de votre offre personnalisée par SMS, acceptation depuis votre espace client. Aucun démarchage téléphonique, aucun commercial ne vous appellera jamais.",
  },
  {
    question: "Combien de temps faut-il pour recevoir mon offre ?",
    answer:
      "Après votre inscription, vous recevez votre offre personnalisée sous 24 à 48h par SMS. Vous pouvez ensuite la consulter en détail sur votre espace client et prendre votre décision en toute tranquillité.",
  },
  {
    question: "Qui s'occupe des démarches de changement de fournisseur ?",
    answer:
      "Si vous acceptez l'offre, nous nous occupons de toutes les démarches administratives auprès du nouveau fournisseur. La transition se fait sans coupure et sans intervention de votre part. Vous n'avez rien à faire.",
  },
  {
    question: "L'achat groupé est-il fiable et sécurisé ?",
    answer:
      "Oui, Switchly est une plateforme 100% française et sécurisée. Vos données personnelles sont protégées conformément au RGPD. Nous ne revendons jamais vos informations et travaillons uniquement avec des partenaires de confiance.",
  },
];

export function FAQSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 lg:mb-6">
            Questions fréquentes
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur l'achat groupé d'énergie et d'internet avec Switchly.
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
