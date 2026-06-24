import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturesBar from "@/components/FeaturesBar";
import Transformations from "@/components/Transformations";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";

const GoldDivider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-[#F4C430]/15 to-transparent" />
);

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <FeaturesBar />
      <GoldDivider />
      <Transformations />
      <GoldDivider />
      <Problem />
      <GoldDivider />
      <HowItWorks />
      <GoldDivider />
      <Testimonials />
      <GoldDivider />
      <WaitlistCTA />
      <Footer />
    </main>
  );
}
