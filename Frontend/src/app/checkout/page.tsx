"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Lock, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCart } from "@/hooks/use-cart";
import { useAppliedCoupon } from "@/hooks/use-applied-coupon";
import { getAddresses } from "@/lib/api/addresses";
import { getStoreSettingsClient } from "@/lib/api/settings";
import { checkout, getPaymentStatus } from "@/lib/api/orders";
import type { CheckoutResponse } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format";
import { AddressSection } from "@/components/checkout/address-section";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CouponField } from "@/components/checkout/coupon-field";
import { PaymentSection, type PaymentMethodType } from "@/components/checkout/payment-section";
import { CartChangedBanner } from "@/components/products/cart-changed-banner";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { cart, isLoading: cartLoading } = useCart();
  const { coupon, setCoupon } = useAppliedCoupon();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("card");
  const [session, setSession] = useState<CheckoutResponse["payment"] & { orderNumber: string } | null>(null);
  // Set the moment an order is successfully placed, so the "cart is empty ->
  // go back to /cart" guard below can't hijack the navigation to the
  // confirmation page (placing an order clears the cart).
  const [orderPlaced, setOrderPlaced] = useState(false);

  // One key per visit, reused across retries so a network blip after clicking
  // pay can't produce a second order.
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  const addressesQuery = useQuery({ queryKey: ["addresses"], queryFn: getAddresses });
  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: getStoreSettingsClient });

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login?next=/checkout");
    }
  }, [userLoading, user, router]);

  useEffect(() => {
    if (!selectedAddressId && addressesQuery.data && addressesQuery.data.length > 0) {
      const defaultAddress = addressesQuery.data.find((a) => a.isDefault) ?? addressesQuery.data[0];
      setSelectedAddressId(defaultAddress._id);
    }
  }, [addressesQuery.data, selectedAddressId]);

  useEffect(() => {
    // Gated on `user` because the cart query is disabled until auth resolves,
    // and a disabled query reports isLoading:false — otherwise an empty
    // placeholder cart is indistinguishable from a genuinely empty one.
    // Also skipped once a payment session exists: the cart legitimately still
    // has items while the customer is mid-payment.
    if (!orderPlaced && !session && user && !cartLoading && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [orderPlaced, session, user, cartLoading, cart.items.length, router]);

  const shippingCost = useMemo(() => {
    if (!settingsQuery.data) return null;
    if (coupon?.freeShipping) return 0;
    return cart.subtotal >= settingsQuery.data.freeShippingThresholdMinorUnits
      ? 0
      : settingsQuery.data.flatShippingRateMinorUnits;
  }, [settingsQuery.data, cart.subtotal, coupon?.freeShipping]);

  const discountAmount = coupon?.discountAmount ?? 0;
  const total = shippingCost === null ? null : cart.subtotal + shippingCost - discountAmount;
  const cartIsClean = !cart.hasChanges && cart.items.every((i) => i.available);

  // While the payment frame is open, poll our own backend rather than trusting
  // the provider's browser redirect — that redirect is lost if the customer
  // closes the tab or a 3-D Secure step misbehaves, and the webhook is the
  // real source of truth anyway.
  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const status = await getPaymentStatus(session.orderNumber);
        if (cancelled) return;

        if (status.paymentStatus === "paid") {
          clearInterval(interval);
          setOrderPlaced(true);
          queryClient.invalidateQueries({ queryKey: ["cart", "server"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          router.push(`/order-confirmation/${session.orderNumber}`);
        } else if (status.paymentStatus === "failed") {
          clearInterval(interval);
          setSession(null);
          idempotencyKey.current = crypto.randomUUID();
          queryClient.invalidateQueries({ queryKey: ["cart", "server"] });
          toast.error("That payment didn't go through. Your bag is unchanged — please try again.");
        }
      } catch {
        // Transient network error: keep polling rather than tearing down a
        // payment the customer may be halfway through.
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session, queryClient, router]);

  const handleSessionExpired = useCallback(() => {
    setSession(null);
    idempotencyKey.current = crypto.randomUUID();
    queryClient.invalidateQueries({ queryKey: ["cart", "server"] });
    toast.error("The payment window expired and your items were released. Please try again.");
  }, [queryClient]);

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      checkout(selectedAddressId!, idempotencyKey.current, paymentMethod, coupon?.code ?? null),
    onSuccess: (result) => {
      // Consumed by the order that was just placed (or is now mid-payment) —
      // re-applying it to a future order would fail server-side anyway since
      // each coupon is redeemable once per user.
      setCoupon(null);
      if (result.payment) {
        setSession({ ...result.payment, orderNumber: result.order.orderNumber });
        return;
      }
      setOrderPlaced(true);
      queryClient.invalidateQueries({ queryKey: ["cart", "server"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push(`/order-confirmation/${result.order.orderNumber}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Could not place your order — please try again");
      if (err?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ["cart", "server"] });
      }
    },
  });

  // Switching method mid-flow abandons the in-progress payment session; the
  // backend sweeper releases its reservation.
  function handleSelectMethod(method: PaymentMethodType) {
    if (method === paymentMethod) return;
    if (session) {
      setSession(null);
      idempotencyKey.current = crypto.randomUUID();
    }
    setPaymentMethod(method);
  }

  if (userLoading || !user) {
    return null;
  }

  const canPlaceOrder =
    !!selectedAddressId && cartIsClean && total !== null && !placeOrderMutation.isPending && !session;

  return (
    <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <h1 className="mb-8 font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
        Checkout
      </h1>

      {/* Mobile: collapsible summary, mirroring the sticky desktop sidebar */}
      <div className="mb-8 border border-border md:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between px-4 py-4 text-[13px]"
        >
          <span className="flex items-center gap-2 font-medium text-foreground">
            Order Summary
            <ChevronDown
              className={`size-4 transition-transform ${summaryOpen ? "rotate-180" : ""}`}
              strokeWidth={1.5}
            />
          </span>
          <span className="font-semibold text-foreground">{total === null ? "—" : formatPrice(total)}</span>
        </button>
        {summaryOpen && (
          <div className="space-y-4 border-t border-border p-4">
            <CouponField />
            <OrderSummary
              items={cart.items}
              subtotal={cart.subtotal}
              shippingCost={shippingCost}
              discountAmount={discountAmount}
              couponCode={coupon?.code ?? null}
              total={total}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="space-y-10 md:col-span-2">
          <CartChangedBanner items={cart.items} />

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-3 font-heading text-headline-sm font-bold text-foreground">
              Contact
            </h2>
            <p className="border border-border bg-muted px-4 py-3 text-sm text-foreground">{user.email}</p>
          </section>

          <AddressSection
            addresses={addressesQuery.data ?? []}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />

          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="mb-4 font-heading text-headline-sm font-bold text-foreground">
              Shipping Method
            </h2>
            <div className="flex items-center justify-between border border-foreground p-4 text-sm">
              <span className="flex items-center gap-3 text-foreground">
                <Truck className="size-4" strokeWidth={1.5} />
                Standard Shipping
              </span>
              <span className="font-medium text-foreground">
                {shippingCost === null ? "—" : shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
              </span>
            </div>
          </section>

          <PaymentSection
            selected={paymentMethod}
            onSelect={handleSelectMethod}
            iframeUrl={session?.iframeUrl ?? null}
            expiresAt={session?.expiresAt ?? null}
            onExpire={handleSessionExpired}
            disabled={placeOrderMutation.isPending}
          />

          {session ? (
            <div className="border border-border bg-muted px-5 py-4 text-[13px] text-muted-foreground">
              Complete your card details above to finish this order. We&apos;ll confirm automatically once
              your payment goes through.
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => placeOrderMutation.mutate()}
                disabled={!canPlaceOrder}
                className="w-full bg-primary py-4 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placeOrderMutation.isPending
                  ? "Processing…"
                  : paymentMethod === "card"
                    ? `Pay ${total === null ? "" : formatPrice(total)}`
                    : "Place Order"}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
                <Lock className="size-3" strokeWidth={2} />
                Secure checkout — your payment details are never stored on our servers.
              </p>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <div className="sticky top-24 space-y-6 bg-muted p-8">
            <OrderSummary
              items={cart.items}
              subtotal={cart.subtotal}
              shippingCost={shippingCost}
              discountAmount={discountAmount}
              couponCode={coupon?.code ?? null}
              total={total}
            />
            <CouponField />
          </div>
        </div>
      </div>
    </div>
  );
}
