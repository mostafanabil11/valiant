"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/products/product-card";
import type { ProductSize } from "@/types/product";

type Sort = "newest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ProductBrowser({
  categoryId,
  size,
  q,
}: {
  categoryId?: string;
  size?: ProductSize;
  q?: string;
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    setPage(1);
  }, [categoryId, size, sort, q]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", { categoryId, size, sort, page, q }],
    queryFn: () => getProducts({ category: categoryId, size, sort, page, limit: 12, q }),
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          {isLoading ? "Loading…" : `${data?.pagination.total ?? 0} products`}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="border border-border bg-background px-3 py-2 text-[12px] font-medium tracking-[0.05em] text-foreground uppercase outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-3/4 animate-pulse bg-muted" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-body-lg text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {data.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {data.pagination.pages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="text-foreground transition-opacity hover:opacity-70 disabled:opacity-30"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <p className="text-[12px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                Page {data.pagination.page} of {data.pagination.pages}
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page >= data.pagination.pages}
                aria-label="Next page"
                className="text-foreground transition-opacity hover:opacity-70 disabled:opacity-30"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
