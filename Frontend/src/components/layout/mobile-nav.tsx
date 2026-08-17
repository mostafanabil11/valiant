"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Menu } from "lucide-react";
import { Category } from "@/types/category";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InstagramIcon, FacebookIcon } from "@/components/icons/social-icons";

interface MobileNavProps {
  categories: Category[];
}

export function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  // activeCategory keeps track of the currently viewed sub-menu
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  return (
    <Sheet open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        // reset drill-down when closing
        setTimeout(() => setActiveCategory(null), 300);
      }
    }}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex flex-col overflow-hidden p-0 data-[side=left]:w-[88vw] data-[side=left]:sm:w-[400px] data-[side=left]:sm:max-w-none"
      >
        {/* Main Menu View */}
        <div
          className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out ${
            activeCategory ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {/* Generous clearance below the sheet's own close button, then the
              brand mark, then a true full-bleed divider — full sheet width,
              not fighting the content's own side padding. */}
          <div className="pt-16 pb-6 px-margin-mobile text-left">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-sans text-2xl font-extrabold tracking-[0.15em] text-foreground"
            >
              VALIANT
            </Link>
          </div>
          <div className="h-px w-full bg-border" />

          <nav className="flex flex-1 flex-col gap-[26px] overflow-y-auto px-margin-mobile pt-9 pb-8">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-[15px] font-bold tracking-[0.1em] text-muted-foreground uppercase transition-opacity hover:text-foreground hover:opacity-70"
            >
              Home
            </Link>

            {categories.map((category) => {
              const hasChildren = category.children && category.children.length > 0;
              return (
                <div key={category._id} className="flex items-center justify-between">
                  {hasChildren ? (
                    <button
                      onClick={() => setActiveCategory(category)}
                      className="flex w-full items-center justify-between py-1 text-left text-[15px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-opacity hover:opacity-70 hover:text-foreground"
                    >
                      {category.name}
                      <ChevronRight className="size-5 text-muted-foreground" strokeWidth={1.5} />
                    </button>
                  ) : (
                    <Link
                      href={`/${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="w-full py-1 text-left text-[15px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-opacity hover:opacity-70 hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              );
            })}

            <Link
              href="/sale"
              onClick={() => setOpen(false)}
              className="text-[15px] font-bold tracking-[0.1em] text-[#B3261E] uppercase transition-opacity hover:opacity-70"
            >
              20% off selected items
            </Link>

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="text-[15px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-opacity hover:opacity-70 hover:text-foreground"
            >
              Contact Us
            </Link>
          </nav>

          {/* Full-bleed divider matching the one under the brand mark, then a
              compact footer block with a little breathing room on each side. */}
          <div className="shrink-0">
            <div className="h-px w-full bg-border" />
            <div className="flex flex-col items-start gap-4 px-margin-mobile pt-6 pb-8">
              <div className="flex gap-6">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <InstagramIcon className="size-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FacebookIcon className="size-5" />
                </a>
              </div>
              <p className="text-left text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                Modern Luxury. Defined by restraint.
              </p>
              <p className="text-left text-[10px] tracking-[0.1em] text-muted-foreground/70 uppercase">
                © {new Date().getFullYear()} Valiant. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Subcategory Drill-down View */}
        <div
          className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out ${
            activeCategory ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pt-16">
            <div className="h-px w-full bg-border" />
          </div>

          <div className="flex items-center gap-3 px-margin-mobile pt-9 pb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className="-ml-1 p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Go back"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <span className="text-[16px] font-bold tracking-[0.1em] text-foreground uppercase">
              {activeCategory?.name}
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-[26px] overflow-y-auto px-margin-mobile pb-8">
            <Link
              href={`/${activeCategory?.slug}`}
              onClick={() => setOpen(false)}
              className="text-[14px] font-medium tracking-[0.1em] text-muted-foreground uppercase transition-opacity hover:text-foreground"
            >
              Shop All {activeCategory?.name}
            </Link>

            {activeCategory?.children?.map((child) => (
              <Link
                key={child._id}
                href={`/${activeCategory.slug}/${child.slug}`}
                onClick={() => setOpen(false)}
                className="text-[14px] font-medium tracking-[0.1em] text-muted-foreground uppercase transition-opacity hover:text-foreground"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
