"use client";

import { usePathname } from "next/navigation";

// Brand messaging, so it belongs anywhere someone is still browsing or
// deciding — the homepage, categories, sale, a product, the help pages.
//
// It does not belong once they are doing something: paying, checking an order,
// signing in, or working in the admin area. There it is decoration competing
// with a task, and on a phone it costs a line of screen the task needed.
const HIDDEN_ON = [
  "/cart",
  "/checkout",
  "/order-confirmation",
  "/track-order",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/account",
  "/admin",
];

export function TrustBar() {
  const pathname = usePathname();

  // startsWith rather than equality: /checkout/result and /account/orders are
  // just as much part of those flows as their parents.
  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  return (
    // py-1.5 rather than py-3, and two phrases rather than three: at 11px on a
    // 375px screen the old line wrapped, which is what actually made this 58px
    // tall — a second line of text, not the padding. One line and tighter
    // padding halves it, and the phrases that survive are the ones that say
    // something about the clothes.
    <div className="w-full border-b border-border bg-muted py-1.5 text-center">
      <p className="text-[11px] font-medium tracking-[0.15em] text-muted-foreground uppercase md:text-[12px]">
        Timeless Design <span className="mx-2 text-border">·</span> Made to Last
      </p>
    </div>
  );
}
