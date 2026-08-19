import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

const FOOTER_LINKS = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-stack-xl w-full border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-(--spacing-container-max) grid-cols-1 gap-gutter px-margin-mobile py-stack-md md:grid-cols-4 md:px-margin-desktop">
        <div className="flex flex-col items-start">
          <span className="mb-4 font-sans text-xl font-bold tracking-[0.25em] text-foreground">
            VALIANT
          </span>
          <p className="text-body-md text-muted-foreground">
            Modern Luxury.
            <br />
            Defined by restraint.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-2">
          {[FOOTER_LINKS.slice(0, 3), FOOTER_LINKS.slice(3)].map((column, i) => (
            <div key={i} className="flex flex-col gap-4">
              {column.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[12px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-4 md:mt-0 md:items-end">
          <div className="w-full md:text-right">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Join the List
            </p>
            <div className="md:ml-auto">
              <NewsletterForm />
            </div>
          </div>
          <p className="text-[12px] tracking-[0.1em] text-muted-foreground uppercase">
            © {new Date().getFullYear()} VALIANT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
