import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsContent } from "./products-content";

export const metadata: Metadata = {
  title: "Shop All Products — Valiant",
  description: "Browse the full Valiant collection — modern essentials, made to last.",
};

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
