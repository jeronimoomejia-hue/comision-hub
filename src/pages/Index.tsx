import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ServicesSection from "@/components/landing/ServicesSection";
import CompaniesSection from "@/components/landing/CompaniesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import CrewsBanner from "@/components/landing/CrewsBanner";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <HowItWorksSection />
        <ServicesSection />
        <CompaniesSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
        <CrewsBanner />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
