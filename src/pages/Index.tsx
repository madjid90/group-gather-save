import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/HeroSection";
import { SavingsCalculator } from "@/components/landing/SavingsCalculator";
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
        defaultTitle="Switchly — Comparer énergie et internet | Économisez jusqu'à 400€/an"
        defaultDescription="Comparateur d'électricité, gaz et internet gratuit. Trouvez les meilleures offres en 30 secondes. Sans engagement, sans coupure. 100% gratuit."
      />
      
      {/* JSON-LD Structured Data */}
      <JsonLdSchema type="auto" />
      
      {/* Main content - no snap scroll, natural scrolling */}
      <div className="w-full">
        {/* 1. Hero */}
        <HeroSection />
        
        {/* 2. Calculateur d'économies */}
        <SavingsCalculator />
        
        {/* 3. Comment ça marche */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <HowItWorksSection />
          </Suspense>
        </LazySection>

        {/* Tableau économies */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Combien pouvez-vous économiser ?</h2>
            <p className="text-center text-muted-foreground mb-8 text-sm">Estimations basées sur les tarifs moyens 2025 vs tarif réglementé EDF.</p>
            <div className="overflow-x-auto rounded-xl border border-border -mx-2 px-2">
              <table className="w-full text-sm min-w-[380px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-3 whitespace-nowrap">Logement</th>
                    <th className="text-center py-3 px-3 whitespace-nowrap">EDF actuel</th>
                    <th className="text-center py-3 px-3 text-primary whitespace-nowrap">Meilleure offre</th>
                    <th className="text-center py-3 px-3 text-secondary whitespace-nowrap">Économie/an</th>
                  </tr>
                </thead>
                <tbody>
                  {[['Studio 30m²','~720€','~500€','220€'],['T2 50m²','~960€','~672€','288€'],['T3 75m²','~1 320€','~924€','396€'],['Maison 100m²','~1 680€','~1 176€','504€'],['Maison 150m²+','~2 280€','~1 596€','684€']].map(([s,e,o,ec]) => (
                    <tr key={s} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-medium whitespace-nowrap">{s}</td>
                      <td className="py-3 px-3 text-center text-muted-foreground whitespace-nowrap">{e}</td>
                      <td className="py-3 px-3 text-center font-semibold text-primary whitespace-nowrap">{o}</td>
                      <td className="py-3 px-3 text-center font-bold text-secondary whitespace-nowrap">-{ec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-6">
              <Button size="lg" asChild>
                <Link to="/comparer">Calculer mes économies personnalisées →</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* 4. Pourquoi Switchly */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <AdvantagesSection />
          </Suspense>
        </LazySection>
        
        {/* 5. Témoignages */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <TestimonialsSection />
          </Suspense>
        </LazySection>
        
        {/* 6. Fournisseurs partenaires */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <PartnersSection />
          </Suspense>
        </LazySection>
        
        {/* 7. FAQ */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <FAQSection />
          </Suspense>
        </LazySection>
        
        {/* 8. CTA final */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <CTASection />
          </Suspense>
        </LazySection>
        
        {/* 9. Collectivités */}
        <LazySection>
          <Suspense fallback={<SectionSkeleton />}>
            <CollectivitesSection />
          </Suspense>
        </LazySection>
        
        {/* Spacer for fixed CTA on mobile */}
        <div className="h-24 md:hidden" />
      </div>
      
      {/* Fixed CTA for mobile only */}
      <MobileFixedCTA />
      
      {/* Social proof notifications */}
      <SocialProofNotifications />
      
      {/* Floating share button */}
      <FloatingShareButton />
    </PageTransition>
  );
};

export default Index;
