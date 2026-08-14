"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { ProductBrowser } from "@/components/products/product-browser";

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [term, setTerm] = useState(initialQ);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQ);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = term.trim();
      setDebouncedTerm(trimmed);
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      router.replace(`/search${params.toString() ? `?${params}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
  }, [term, router]);

  return (
    <div>
      <section className="border-b border-border bg-background py-16 text-center md:py-20">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-margin-mobile">
          <SearchIcon className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for t-shirts, pants, jackets…"
            aria-label="Search products"
            className="w-full border-b border-border bg-transparent pb-3 text-center font-heading text-headline-sm font-bold text-foreground outline-none placeholder:text-muted-foreground placeholder:font-normal focus:border-foreground"
          />
        </div>
      </section>

      <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
        {debouncedTerm ? (
          <ProductBrowser q={debouncedTerm} />
        ) : (
          <p className="py-24 text-center text-body-lg text-muted-foreground">
            Start typing to search our collection.
          </p>
        )}
      </div>
    </div>
  );
}
