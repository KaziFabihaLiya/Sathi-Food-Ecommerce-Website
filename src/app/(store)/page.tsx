import Hero from "@/components/store/Hero";
import TrustStrip from "@/components/store/TrustStrip";
import Collection from "@/components/store/Collection";
import Gallery from "@/components/store/Gallery";
import OrderSection from "@/components/store/OrderSection";
import ReviewsCarousel from "@/components/store/ReviewsCarousel";
import CtaBanner from "@/components/store/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Collection />
      <Gallery />
      <OrderSection />
      <ReviewsCarousel />
      <CtaBanner />
    </>
  );
}
