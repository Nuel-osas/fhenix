import Hero from "@/components/landing/Hero";
import SignalMarquee from "@/components/landing/SignalMarquee";
import HowItWorks from "@/components/landing/HowItWorks";
import UseCases from "@/components/landing/UseCases";
import Features from "@/components/landing/Features";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <SignalMarquee />
      <HowItWorks />
      <UseCases />
      <Features />
      <Footer />
    </main>
  );
}
