"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";

export function CartIconLink({ className, showLabel }: { className?: string; showLabel?: boolean }) {
  const [isMounted, setIsMounted] = useState(false);
  const { itemCount: count } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Link href="/cart" className={className}>
      {showLabel && <span className="hidden md:inline">Cart</span>}
      <span className="relative inline-flex">
        <ShoppingBag className="size-5 md:size-[18px]" strokeWidth={1.5} />
        {isMounted && count > 0 && (
          <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-semibold text-background">
            {count}
          </span>
        )}
      </span>
    </Link>
  );
}
