import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { CollectivitesSection } from "@/components/landing/CollectivitesSection";
import { SocialProofNotifications } from "@/components/landing/SocialProofNotifications";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";
import { FloatingShareButton } from "@/components/landing/FloatingShareButton";
import { PageTransition } from "@/components/PageTransition";
import { LazySection } from "@/components/ui/LazySection";

const Index = () => {
  return (
    <PageTransition>
      {/* 1. Hero - Always loaded immediately */}
      <HeroSection />
      
      {/* 2. Comment ça marche */}
      <LazySection>
        <HowItWorksSection />
      </LazySection>
      
      {/* 3. Pourquoi Switchly */}
      <LazySection>
        <AdvantagesSection />
      </LazySection>
      
      {/* 4. Témoignages */}
      <LazySection>
        <TestimonialsSection />
      </LazySection>
      
      {/* 5. Fournisseurs partenaires */}
      <LazySection>
        <PartnersSection />
      </LazySection>
      
      {/* 6. FAQ */}
      <LazySection>
        <FAQSection />
      </LazySection>
      
      {/* 7. CTA final */}
      <LazySection>
        <CTASection />
      </LazySection>
      
      {/* 8. Collectivités */}
      <LazySection>
        <CollectivitesSection />
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
