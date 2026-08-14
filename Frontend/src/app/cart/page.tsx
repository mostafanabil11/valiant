"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-(--spacing-container-max) flex-col items-center px-margin-mobile py-stack-xl text-center md:px-margin-desktop">
        <h1 className="mb-4 font-heading text-headline-md font-bold text-foreground">
          Your Bag is Empty
        </h1>
        <p className="mb-8 text-body-md text-muted-foreground">
          Explore the collection and find something you love.
        </p>
        <Link
          href="/"
          className="bg-primary px-8 py-4 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <h1 className="mb-12 font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
        Shopping Bag
      </h1>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {/* Items */}
        <div className="md:col-span-2">
          <div className="divide-y divide-border border-t border-b border-border">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-6 py-6">
                <Link href={`/products/${item.slug}`} className="relative aspect-3/4 w-24 shrink-0 bg-muted">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="text-body-md text-foreground">{item.name}</h3>
                      </Link>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {item.color} · Size {item.size}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.size)}
                      aria-label="Remove item"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-2 text-foreground transition-opacity hover:opacity-70"
                      >
                        <Minus className="size-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="min-w-4 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-2 text-foreground transition-opacity hover:opacity-70"
                      >
                        <Plus className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-[13px] font-semibold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit bg-muted p-8">
          <h2 className="mb-6 text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase">
            Order Summary
          </h2>
          <div className="mb-6 flex items-center justify-between text-body-md">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <p className="mb-6 text-[12px] text-muted-foreground">
            Shipping and taxes calculated at checkout.
          </p>
          <button
            type="button"
            className="w-full bg-primary py-4 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
