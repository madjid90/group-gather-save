import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { MobileFixedCTA } from "@/components/landing/MobileFixedCTA";

const Index = () => {
  return (
    <>
      <HeroSection />
      {/* How it works moved higher on mobile via CSS order */}
      <div className="contents md:contents">
        <div className="order-1 md:order-none">
          <HowItWorksSection />
        </div>
        <div className="order-2 md:order-none">
          <AdvantagesSection />
        </div>
        <div className="order-3 md:order-none">
          <PartnersSection />
        </div>
        <div className="order-4 md:order-none">
          <TestimonialsSection />
        </div>
        <div className="order-5 md:order-none">
          <FAQSection />
        </div>
        <div className="order-6 md:order-none">
          <CTASection />
        </div>
      </div>
      {/* Fixed CTA for mobile only */}
      <MobileFixedCTA />
      {/* Spacer for fixed CTA on mobile */}
      <div className="h-20 md:hidden" />
    </>
  );
};

export default Index;
