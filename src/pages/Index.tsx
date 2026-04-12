import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import AIIntelligence from "@/components/landing/AIIntelligence";
import WhyItMatters from "@/components/landing/WhyItMatters";
import CTA from "@/components/landing/CTA";

export default function Index() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <AIIntelligence />
      <WhyItMatters />
      <CTA />
    </div>
  );
}
