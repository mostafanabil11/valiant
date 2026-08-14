"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";

function categoryHref(category: Category) {
  return category.parent ? `/products?category=${category._id}` : `/${category.slug}`;
}

function CollectionTile({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <Link
      href={categoryHref(category)}
      className={`group relative block overflow-hidden bg-muted ${className ?? ""}`}
    >
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      )}
      {/* Overlay: gradient darkens toward the bottom so the white label/CTA stay legible over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent transition-opacity duration-500 group-hover:from-black/50" />
      <div className="absolute bottom-8 left-8">
        <h3 className="mb-2 font-heading text-headline-sm font-bold text-white">{category.name}</h3>
        <span className="inline-flex items-center border-b border-white pb-1 text-[12px] font-semibold tracking-[0.1em] text-white uppercase transition-all group-hover:pr-4">
          Explore <ArrowRight className="ml-2 size-4" />
        </span>
      </div>
    </Link>
  );
}

// Matches the true aspect ratio of the Men/Women source photos (736x1094 / 736x1104,
// both ~2:3 portrait) so the images display uncropped instead of being forced into a
// fixed-height box.
const TOP_ROW_ASPECT = "aspect-[2/3]";
const TALL_HEIGHT = "h-[420px]";
const SHORT_HEIGHT = "h-[320px]";

export function ShopCollections() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", "featured"],
    queryFn: getFeaturedCategories,
  });

  if (!isLoading && (!categories || categories.length === 0)) {
    return null;
  }

  // Men/Women (top-level) get an equal-size pair up top; the subcategories
  // (Long Sleeve Shirts, T-Shirts, Pants, Pullovers) form a composed grid below.
  const topLevel = (categories ?? []).filter((c) => !c.parent);
  const subCategories = (categories ?? []).filter((c) => c.parent);

  return (
    <section className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <h2 className="mb-12 text-center font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
        Shop Collections
      </h2>

      {isLoading ? (
        <div className="flex flex-col gap-gutter">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
            <div className={`${TOP_ROW_ASPECT} animate-pulse bg-muted`} />
            <div className={`${TOP_ROW_ASPECT} animate-pulse bg-muted`} />
          </div>
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {[TALL_HEIGHT, SHORT_HEIGHT, TALL_HEIGHT, SHORT_HEIGHT].map((h, i) => (
              <div
                key={i}
                className={`${h} animate-pulse bg-muted ${i % 2 === 1 ? "md:mt-16" : ""}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-gutter">
          {/* Men / Women — equal size, side by side */}
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
            {topLevel.map((category) => (
              <CollectionTile key={category._id} category={category} className={TOP_ROW_ASPECT} />
            ))}
          </div>

          {/* Long Sleeve Shirts / T-Shirts / Pants / Pullovers — staggered composition,
              not a flat row: alternating tiles are offset down on desktop for rhythm. */}
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {subCategories.map((category, i) => (
              <CollectionTile
                key={category._id}
                category={category}
                className={`${i % 2 === 0 ? TALL_HEIGHT : `${SHORT_HEIGHT} md:mt-16`}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
