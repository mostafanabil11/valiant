import { Hero } from "@/components/home/hero";
import { BestSellers } from "@/components/home/best-sellers";
import { ShopCollections } from "@/components/home/shop-collections";

// TrustBar used to live here. It now renders from the root layout, so it
// appears on every browsing page rather than only this one.
export default function Home() {
  return (
    <>
      <Hero />
      <BestSellers />
      <ShopCollections />
    </>
  );
}
