import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/HeroSection";
import { SavingsCalculator } from "@/components/landing/SavingsCalculator";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";
import { PageTransition } from "@/components/PageTransition";
import { LazySection } from "@/components/ui/LazySection";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { DynamicSEOHead } from "@/components/seo/DynamicSEOHead";

const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const AdvantagesSection = lazy(() => import("@/components/landing/AdvantagesSection").then(m => ({ default: m.AdvantagesSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import("@/components/landing/CTASection").then(m => ({ default: m.CTASection })));
const VillesPopulairesSection = lazy(() => import("@/components/landing/VillesPopulairesSection").then(m => ({ default: m.VillesPopulairesSection })));

const SectionSkeleton = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <PageTransition>
      <DynamicSEOHead 
        defaultTitle="Switchly — Comparateur électricité et gaz | Économisez jusqu'à 300€/an"
        defaultDescription="Comparateur d'électricité et gaz gratuit. Trouvez les meilleures offres en 30 secondes. Sans engagement, sans coupure. 100% gratuit."
      />
      <JsonLdSchema type="auto" />
      
      <div className="w-full">
        <HeroSection />
        <SavingsCalculator />
        
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <HowItWorksSection />
          </Suspense>
        </LazySection>

        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <AdvantagesSection />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <TestimonialsSection />
          </Suspense>
        </LazySection>

        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <VillesPopulairesSection />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <FAQSection />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <CTASection />
          </Suspense>
        </LazySection>

        <div className="h-24 md:hidden" />
      </div>
      
      <MobileFixedCTA />
    </PageTransition>
  );
};

export default Index;
