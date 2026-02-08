import { Navbar } from "@/components/shared/navbar";
import { CategoriesSection } from "@/features/landing/CategoriesSection";
import { CtaSection } from "@/features/landing/CTASection";
import { FeaturedProducts } from "@/features/landing/FeaturedProducts";
import { HeroSection } from "@/features/landing/HeroSection";
import { TestimonialsSection } from "@/features/landing/TestimonialsSection";
import { Footer } from "@/components/shared/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
