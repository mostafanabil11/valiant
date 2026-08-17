import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Valiant",
  description: "Answers to common questions about ordering, shipping, and payments at Valiant.",
};

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What payment methods do you accept?",
    answer: "Cash on Delivery and card payments (Visa, Mastercard, Meeza) processed securely by Paymob.",
  },
  {
    question: "Where do you ship?",
    answer: "We currently ship within Egypt only, to any governorate.",
  },
  {
    question: "How much is shipping?",
    answer:
      "A flat EGP 50, free automatically on orders over EGP 3,000 — no code needed, it's applied at checkout.",
  },
  {
    question: "Can I cancel my order?",
    answer: (
      <>
        Yes, any time before it ships and before it&apos;s been paid for — open the order in{" "}
        <Link href="/account/orders" className="text-foreground underline">
          Order History
        </Link>{" "}
        and select Cancel. Once an order has shipped, see our{" "}
        <Link href="/shipping-returns" className="text-foreground underline">
          Shipping &amp; Returns
        </Link>{" "}
        page instead.
      </>
    ),
  },
  {
    question: "How do I track my order?",
    answer: (
      <>
        Once it ships you&apos;ll get an email, and the tracking number will appear on the order in{" "}
        <Link href="/account/orders" className="text-foreground underline">
          Order History
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I use a coupon code?",
    answer: "Enter it in the Coupon field on your bag or at checkout — the discount is applied instantly.",
  },
  {
    question: "What's your return policy?",
    answer: (
      <>
        Unworn items with tags attached can be returned within 14 days of delivery. See{" "}
        <Link href="/shipping-returns" className="text-foreground underline">
          Shipping &amp; Returns
        </Link>{" "}
        for details.
      </>
    ),
  },
  {
    question: "How do I know what size to order?",
    answer: (
      <>
        Check our{" "}
        <Link href="/size-guide" className="text-foreground underline">
          Size Guide
        </Link>{" "}
        for body measurements, plus any fit note on the product page.
      </>
    ),
  },
  {
    question: "I forgot my password — what do I do?",
    answer: (
      <>
        Select &ldquo;Forgot password?&rdquo; on the{" "}
        <Link href="/login" className="text-foreground underline">
          sign-in page
        </Link>{" "}
        to get a reset link by email.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-12 font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
          Frequently Asked Questions
        </h1>

        <div className="divide-y divide-border border-t border-b border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-foreground marker:content-none">
                {faq.question}
                <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>

        <p className="mt-10 text-[13px] text-muted-foreground">
          Still have a question?{" "}
          <Link href="/contact" className="text-foreground underline">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
