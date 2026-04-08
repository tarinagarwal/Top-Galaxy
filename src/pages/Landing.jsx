import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import HeroSection from '../components/landing/HeroSection';
import LiveStatsSection from '../components/landing/LiveStatsSection';
import RegistrationSection from '../components/landing/RegistrationSection';
import ConversionSection from '../components/landing/ConversionSection';
import PlanetsSection from '../components/landing/PlanetsSection';
import WinnersSection from '../components/landing/WinnersSection';
import ProtectionSection from '../components/landing/ProtectionSection';
import NetworkSection from '../components/landing/NetworkSection';
import RoiSection from '../components/landing/RoiSection';
import IncomesSection from '../components/landing/IncomesSection';
import LuckyDrawSection from '../components/landing/LuckyDrawSection';
import ClubSection from '../components/landing/ClubSection';
import RoadmapSection from '../components/landing/RoadmapSection';
import TechSection from '../components/landing/TechSection';
import CtaSection from '../components/landing/CtaSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Landing() {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef}>
      <StarfieldCanvas />
      <Navbar />
      <HeroSection />
      <LiveStatsSection />
      <RegistrationSection />
      <ConversionSection />
      <PlanetsSection />
      <WinnersSection />
      <ProtectionSection />
      <NetworkSection />
      <RoiSection />
      <IncomesSection />
      <LuckyDrawSection />
      <ClubSection />
      <RoadmapSection />
      <TechSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
