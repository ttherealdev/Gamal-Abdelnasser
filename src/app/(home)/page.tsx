import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/hero";
import AboutSection from "@/components/landing/about";
import MissionSection from "@/components/landing/mission";
import DepartmentsSection from "@/components/landing/departments";
import ContactSection from "@/components/landing/contact";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <MissionSection />
        <DepartmentsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
