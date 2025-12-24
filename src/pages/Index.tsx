import { lazy, Suspense } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";
import { FloatingShareButton } from "@/components/landing/FloatingShareButton";
import { PageTransition } from "@/components/PageTransition";
import { LazySection } from "@/components/ui/LazySection";

// Lazy load sections below the fold
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const AdvantagesSection = lazy(() => import("@/components/landing/AdvantagesSection").then(m => ({ default: m.AdvantagesSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const PartnersSection = lazy(() => import("@/components/landing/PartnersSection").then(m => ({ default: m.PartnersSection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import("@/components/landing/CTASection").then(m => ({ default: m.CTASection })));
const CollectivitesSection = lazy(() => import("@/components/landing/CollectivitesSection").then(m => ({ default: m.CollectivitesSection })));
const SocialProofNotifications = lazy(() => import("@/components/landing/SocialProofNotifications").then(m => ({ default: m.SocialProofNotifications })));

const SectionLoader = () => (
  <div className="py-16 lg:py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <PageTransition>
      {/* 1. Hero - Always loaded immediately */}
      <HeroSection />
      
      {/* 2. Comment ça marche */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <HowItWorksSection />
        </Suspense>
      </LazySection>
      
      {/* 3. Pourquoi Switchly */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <AdvantagesSection />
        </Suspense>
      </LazySection>
      
      {/* 4. Témoignages */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
      </LazySection>
      
      {/* 5. Fournisseurs partenaires */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <PartnersSection />
        </Suspense>
      </LazySection>
      
      {/* 6. FAQ */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
      </LazySection>
      
      {/* 7. CTA final */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <CTASection />
        </Suspense>
      </LazySection>
      
      {/* 8. Collectivités */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <CollectivitesSection />
        </Suspense>
      </LazySection>
      
      {/* Fixed CTA for mobile only */}
      <MobileFixedCTA />
      
      {/* Social proof notifications - lazy loaded */}
      <Suspense fallback={null}>
        <SocialProofNotifications />
      </Suspense>
      
      {/* Floating share button */}
      <FloatingShareButton />
      
      {/* Spacer for fixed CTA on mobile */}
      <div className="h-20 md:hidden" />
    </PageTransition>
  );
};

export default Index;
