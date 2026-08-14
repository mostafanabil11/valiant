import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/trust-bar";
import { BestSellers } from "@/components/home/best-sellers";
import { ShopCollections } from "@/components/home/shop-collections";

export default function Home() {
  return (
    <>
      <TrustBar />
      <Hero />
      <BestSellers />
      <ShopCollections />
    </>
  );
}
