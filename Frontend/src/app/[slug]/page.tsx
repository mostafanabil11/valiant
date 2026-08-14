"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/lib/api/categories";
import { ProductBrowser } from "@/components/products/product-browser";
import { CategoryPageHeader } from "@/components/products/category-page-header";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ["categories", "slug", params.slug],
    queryFn: () => getCategoryBySlug(params.slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
        <div className="h-[300px] animate-pulse bg-muted" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="mx-auto flex w-full max-w-(--spacing-container-max) flex-col items-center px-margin-mobile py-stack-xl text-center md:px-margin-desktop">
        <h1 className="mb-4 font-heading text-headline-md font-bold text-foreground">
          Category not found
        </h1>
        <Link href="/" className="text-[13px] text-muted-foreground underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <CategoryPageHeader title={category.name} description={category.description} />

      <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
        {/* Subcategory pills */}
        {category.children && category.children.length > 0 && (
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {category.children.map((child) => (
              <Link
                key={child._id}
                href={`/products?category=${child._id}`}
                className="border border-border px-5 py-2 text-[12px] font-semibold tracking-[0.05em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        <ProductBrowser categoryId={category._id} />
      </div>
    </div>
  );
}
