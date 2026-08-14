"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBestSellers } from "@/lib/api/products";
import { ProductCard } from "@/components/products/product-card";

export function BestSellers() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: getBestSellers,
  });

  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
          Best Sellers
        </h2>
        <Link
          href="/products"
          className="border-b border-transparent pb-1 text-[12px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-all hover:border-foreground hover:text-foreground"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-3/4 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-gutter md:overflow-visible md:pb-0">
          {products!.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              className="w-[70vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none"
            />
          ))}
        </div>
      )}
    </section>
  );
}
