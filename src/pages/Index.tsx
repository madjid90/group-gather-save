import { HeroSection } from "@/components/landing/HeroSection";
import { ShareSection } from "@/components/landing/ShareSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { CollectivitesSection } from "@/components/landing/CollectivitesSection";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";
import { SocialProofNotifications } from "@/components/landing/SocialProofNotifications";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      {/* 1. Hero simplifié */}
      <HeroSection />
      
      {/* 2. Partage & viralité */}
      <ShareSection />
      
      {/* 3. Comment ça marche */}
      <HowItWorksSection />
      
      {/* 4. Pourquoi Switchly */}
      <AdvantagesSection />
      
      {/* 5. Témoignages */}
      <TestimonialsSection />
      
      {/* 6. Fournisseurs partenaires */}
      <PartnersSection />
      
      {/* 7. FAQ */}
      <FAQSection />
      
      {/* 8. CTA final */}
      <CTASection />
      
      {/* 9. Collectivités (section bonus) */}
      <CollectivitesSection />
      
      {/* Fixed CTA for mobile only */}
      <MobileFixedCTA />
      
      {/* Social proof notifications */}
      <SocialProofNotifications />
      
      {/* Spacer for fixed CTA on mobile */}
      <div className="h-20 md:hidden" />
    </PageTransition>
  );
};

export default Index;
