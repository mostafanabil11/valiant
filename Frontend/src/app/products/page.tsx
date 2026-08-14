import { Suspense } from "react";
import { ProductsContent } from "./products-content";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
