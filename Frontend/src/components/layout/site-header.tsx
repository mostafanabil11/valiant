import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/social-icons";
import { CartIconLink } from "@/components/layout/cart-icon-link";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Contact Us", href: "/contact" },
];

export function SiteHeader() {
  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-[12px] font-medium tracking-[0.1em] uppercase">
        Free Worldwide Shipping on Orders Over $300
      </div>

      <header className="sticky top-0 z-40 w-full bg-background">
        {/* Row 1: menu/search — logo — account/cart */}
        <div className="relative mx-auto flex w-full max-w-(--spacing-container-max) items-center justify-between px-margin-mobile py-[47px] md:px-margin-desktop md:py-[55px]">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-margin-mobile">
              <SheetHeader className="p-0">
                <SheetTitle className="font-sans text-xl font-bold tracking-[0.25em]">
                  VALIANT
                </SheetTitle>
              </SheetHeader>
              <p className="text-[12px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Quiet Luxury
              </p>
              <nav className="flex flex-1 flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex gap-6 border-t border-border pt-8">
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
            </SheetContent>
          </Sheet>

          {/* Search (desktop only, left-aligned) */}
          <Link
            href="/search"
            aria-label="Search"
            className="hidden items-center gap-2 text-foreground transition-opacity hover:opacity-70 md:flex"
          >
            <Search className="size-[18px]" strokeWidth={1.5} />
            <span className="text-sm tracking-[0.02em]">Search</span>
          </Link>

          {/* Logo: in-flow + truncating on mobile (guarantees no overlap with the icons on
              either side at any viewport width), viewport-centered via absolute on desktop
              where there's ample room. */}
          <Link
            href="/"
            className="min-w-0 flex-1 truncate px-2 py-3 text-center font-sans text-base font-bold tracking-[0.06em] text-foreground md:absolute md:left-1/2 md:flex-none md:-translate-x-1/2 md:px-4 md:text-6xl md:tracking-[0.3em]"
          >
            VALIANT
          </Link>

          {/* Trailing: account / cart */}
          <div className="ml-auto flex items-center gap-6">
            <Link
              href="/search"
              aria-label="Search"
              className="text-foreground transition-opacity hover:opacity-70 md:hidden"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/login"
              className="hidden items-center gap-2 text-sm tracking-[0.02em] text-foreground transition-opacity hover:opacity-70 md:flex"
            >
              Account
            </Link>
            <Link
              href="/login"
              aria-label="Account"
              className="text-foreground transition-opacity hover:opacity-70 md:hidden"
            >
              <User className="size-5" strokeWidth={1.5} />
            </Link>
            <CartIconLink
              showLabel
              className="flex items-center gap-2 text-sm tracking-[0.02em] text-foreground transition-opacity hover:opacity-70"
            />
          </div>
        </div>

        {/* Row 2: primary nav, its own row below the logo */}
        <nav className="hidden w-full border-t border-b border-border py-4 md:flex md:items-center md:justify-center md:gap-12">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-base font-semibold tracking-[0.05em] text-muted-foreground uppercase transition-colors duration-500 ease-in-out hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:[clip-path:inset(0_50%_0_50%)] after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.65,0,0.35,1)] hover:after:[clip-path:inset(0_0%_0_0%)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
