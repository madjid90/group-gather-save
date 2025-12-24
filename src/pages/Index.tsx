import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { CollectivitesSection } from "@/components/landing/CollectivitesSection";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";
import { SocialProofNotifications } from "@/components/landing/SocialProofNotifications";
import { FloatingShareButton } from "@/components/landing/FloatingShareButton";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      {/* 1. Hero simplifié */}
      <HeroSection />
      
      {/* 2. Comment ça marche */}
      <HowItWorksSection />
      
      {/* 3. Pourquoi Switchly */}
      <AdvantagesSection />
      
      {/* 4. Témoignages */}
      <TestimonialsSection />
      
      {/* 5. Fournisseurs partenaires */}
      <PartnersSection />
      
      {/* 6. FAQ */}
      <FAQSection />
      
      {/* 7. CTA final */}
      <CTASection />
      
      {/* 8. Collectivités */}
      <CollectivitesSection />
      
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
