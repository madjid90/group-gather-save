import { lazy, Suspense } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofNotifications } from "@/components/landing/SocialProofNotifications";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";
import { FloatingShareButton } from "@/components/landing/FloatingShareButton";
import { PageTransition } from "@/components/PageTransition";
import { LazySection } from "@/components/ui/LazySection";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { DynamicSEOHead } from "@/components/seo/DynamicSEOHead";

// Lazy load heavy sections for better initial load
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const AdvantagesSection = lazy(() => import("@/components/landing/AdvantagesSection").then(m => ({ default: m.AdvantagesSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const PartnersSection = lazy(() => import("@/components/landing/PartnersSection").then(m => ({ default: m.PartnersSection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import("@/components/landing/CTASection").then(m => ({ default: m.CTASection })));
const CollectivitesSection = lazy(() => import("@/components/landing/CollectivitesSection").then(m => ({ default: m.CollectivitesSection })));

// Lightweight placeholder
const SectionSkeleton = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <PageTransition>
      {/* Dynamic SEO Head from database */}
      <DynamicSEOHead 
        defaultTitle="Switchly - Achat groupé énergie et internet | Économisez ensemble"
        defaultDescription="Rejoignez l'achat groupé Switchly pour économiser sur vos contrats énergie et internet. Négociation collective, tarifs avantageux, démarches simplifiées."
      />
      
      {/* JSON-LD Structured Data */}
      <JsonLdSchema type="auto" />
      
      {/* 1. Hero - Always loaded immediately for LCP */}
      <HeroSection />
      
      {/* 2. Comment ça marche */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorksSection />
        </Suspense>
      </LazySection>
      
      {/* 3. Pourquoi Switchly */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <AdvantagesSection />
        </Suspense>
      </LazySection>
      
      {/* 4. Témoignages */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>
      </LazySection>
      
      {/* 5. Fournisseurs partenaires */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <PartnersSection />
        </Suspense>
      </LazySection>
      
      {/* 6. FAQ */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
      </LazySection>
      
      {/* 7. CTA final */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <CTASection />
        </Suspense>
      </LazySection>
      
      {/* 8. Collectivités */}
      <LazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <CollectivitesSection />
        </Suspense>
      </LazySection>
      
      {/* Fixed CTA for mobile only */}
      <MobileFixedCTA />
      
      {/* Social proof notifications */}
      <SocialProofNotifications />
      
      {/* Floating share button */}
      <FloatingShareButton />
      
      {/* Spacer for fixed CTA on mobile */}
      <div className="h-20 md:hidden" />
    </PageTransition>
  );
};

export default Index;
