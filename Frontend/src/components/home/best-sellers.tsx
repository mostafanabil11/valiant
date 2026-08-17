"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBestSellers } from "@/lib/api/products";
import { ProductCard } from "@/components/products/product-card";

const DISPLAY_COUNT = 4;

export function BestSellers() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: getBestSellers,
  });

  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  const items = products?.slice(0, DISPLAY_COUNT);

  return (
    <section className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
          Best Sellers
        </h2>
        <p className="mt-3 text-body-md text-muted-foreground">Our most-loved pieces, worn on repeat.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {Array.from({ length: DISPLAY_COUNT }).map((_, i) => (
            <div key={i} className="aspect-3/4 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-gutter">
          {items!.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase transition-all hover:border-foreground"
        >
          View All Products
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
