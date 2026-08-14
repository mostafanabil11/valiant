"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/api/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { ProductSize } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["products", "slug", params.slug],
    queryFn: () => getProductBySlug(params.slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid w-full max-w-(--spacing-container-max) grid-cols-1 gap-gutter px-margin-mobile py-stack-xl md:grid-cols-2 md:px-margin-desktop">
        <div className="aspect-3/4 animate-pulse bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse bg-muted" />
          <div className="h-4 w-1/3 animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto flex w-full max-w-(--spacing-container-max) flex-col items-center px-margin-mobile py-stack-xl text-center md:px-margin-desktop">
        <h1 className="mb-4 font-heading text-headline-md font-bold text-foreground">
          Product not found
        </h1>
        <Link href="/" className="text-[13px] text-muted-foreground underline">
          Back to home
        </Link>
      </div>
    );
  }

  const selectedStock = product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0;

  function handleAddToBag() {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      color: product.color,
      size: selectedSize,
      price: product.discountPrice ?? product.price,
      image: product.images[0] ?? "",
    });
    toast.success(`${product.name} added to your bag`);
  }

  return (
    <div className="mx-auto grid w-full max-w-(--spacing-container-max) grid-cols-1 gap-gutter px-margin-mobile py-stack-xl md:grid-cols-2 md:px-margin-desktop">
      {/* Images */}
      <div>
        <div className="relative mb-4 aspect-3/4 overflow-hidden bg-muted">
          {product.images[activeImage] && (
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              loading="eager"
              fetchPriority="high"
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative aspect-3/4 w-20 overflow-hidden bg-muted transition-opacity ${
                  i === activeImage ? "opacity-100 ring-1 ring-foreground" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h1 className="mb-2 font-heading text-headline-md font-bold text-foreground">
          {product.name}
        </h1>
        <p className="mb-6 text-body-md text-muted-foreground">{product.color}</p>

        <div className="mb-8 flex items-center gap-3">
          <p className="text-headline-sm font-heading text-foreground">
            {formatPrice(product.discountPrice ?? product.price)}
          </p>
          {product.discountPrice && (
            <p className="text-body-md text-muted-foreground line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>

        {/* Size selector */}
        <div className="mb-8">
          <p className="mb-3 text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s.size}
                type="button"
                disabled={s.stock === 0}
                onClick={() => setSelectedSize(s.size)}
                className={`flex h-12 w-14 items-center justify-center border text-sm font-medium transition-colors ${
                  s.stock === 0
                    ? "cursor-not-allowed border-border text-muted-foreground/40 line-through"
                    : selectedSize === s.size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
          {selectedSize && selectedStock > 0 && selectedStock <= 3 && (
            <p className="mt-2 text-[12px] text-muted-foreground">Only {selectedStock} left</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToBag}
          className="mb-10 w-full bg-primary py-4 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
        >
          Add to Bag
        </button>

        {product.description && (
          <p className="mb-10 text-body-md text-muted-foreground">{product.description}</p>
        )}

        {/* Related colors */}
        {product.relatedColors.length > 0 && (
          <div>
            <p className="mb-3 text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase">
              Also Available In
            </p>
            <div className="flex flex-wrap gap-3">
              {product.relatedColors.map((sibling) => (
                <Link
                  key={sibling._id}
                  href={`/products/${sibling.slug}`}
                  className="group relative aspect-3/4 w-20 overflow-hidden bg-muted"
                  title={sibling.color}
                >
                  {sibling.images[0] && (
                    <Image
                      src={sibling.images[0]}
                      alt={sibling.color}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-80"
                      sizes="80px"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
