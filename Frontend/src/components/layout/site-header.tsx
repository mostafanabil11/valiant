import Link from "next/link";
import { Search } from "lucide-react";
import { CartIconLink } from "@/components/layout/cart-icon-link";
import { AccountMenu } from "@/components/layout/account-menu";
import { getStoreSettings } from "@/lib/api/settings";
import { getCategoryTreeServer } from "@/lib/api/categories";
import { formatPrice } from "@/lib/format";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const settings = await getStoreSettings();
  const categories = await getCategoryTreeServer();

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-[12px] font-medium tracking-[0.1em] uppercase">
        Free Worldwide Shipping on Orders Over {formatPrice(settings.freeShippingThresholdMinorUnits)}
      </div>

      <header className="sticky top-0 z-40 w-full bg-background group/header">
        {/* Row 1: menu/search — logo — account/cart */}
        <div className="relative mx-auto flex w-full max-w-(--spacing-container-max) items-center justify-between px-margin-mobile py-6 md:px-margin-desktop md:py-[55px]">
          {/* Leading: mobile menu + search */}
          <div className="flex items-center gap-4">
            <MobileNav categories={categories} />
            
            {/* -m-2 p-2 grows the tap area to ~36px without moving anything:
                the icon is 20px, which is below the 24px minimum a touch
                target should meet and well below the 44px phones are designed
                around. The negative margin cancels the padding for layout, so
                only the hit box changes. */}
            <Link
              href="/search"
              aria-label="Search"
              className="-m-2 flex items-center gap-2 p-2 text-foreground transition-opacity hover:opacity-70"
            >
              <Search className="size-5 md:size-[18px]" strokeWidth={1.5} />
              <span className="hidden text-sm tracking-[0.02em] md:inline">Search</span>
            </Link>
          </div>

          {/* Logo - Absolutely centered on all screens */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-sans text-[26px] font-extrabold tracking-[0.15em] text-foreground md:text-6xl md:tracking-[0.3em]"
          >
            VALIANT
          </Link>

          {/* Trailing: account / cart */}
          <div className="flex items-center gap-6">
            <AccountMenu className="hidden items-center gap-2 text-sm tracking-[0.02em] text-foreground transition-opacity hover:opacity-70 md:flex" />
            <AccountMenu
              iconOnly
              className="-m-2 p-2 text-foreground transition-opacity hover:opacity-70 md:hidden"
            />
            <CartIconLink
              showLabel
              className="-m-2 flex items-center gap-2 p-2 text-sm tracking-[0.02em] text-foreground transition-opacity hover:opacity-70"
            />
          </div>
        </div>

        {/* Row 2: primary nav (desktop only) */}
        <DesktopNav categories={categories} />
      </header>
    </>
  );
}
