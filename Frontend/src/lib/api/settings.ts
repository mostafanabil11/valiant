import { apiClient } from "./client";
import type { StoreSettings } from "@/types/settings";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  currency: "USD",
  taxRateBasisPoints: 0,
  freeShippingThresholdMinorUnits: 0,
  flatShippingRateMinorUnits: 0,
};

// Server-side only (used from Server Components like SiteHeader) — settings
// change rarely, so this is revalidated hourly rather than fetched on every request.
// Falls back to defaults rather than throwing so a temporarily unreachable API
// (e.g. during a build with no live backend configured yet) doesn't take down
// every page, since SiteHeader renders on the root layout.
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return DEFAULT_STORE_SETTINGS;
    const body: ApiEnvelope<StoreSettings> = await res.json();
    return body.data;
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

// Client-side (Client Components, e.g. the checkout page previewing shipping
// cost before the order is actually placed).
export async function getStoreSettingsClient(): Promise<StoreSettings> {
  const res = await apiClient.get<ApiEnvelope<StoreSettings>>("/settings");
  return res.data.data;
}

// --- Admin ---

export async function updateStoreSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await apiClient.patch<ApiEnvelope<StoreSettings>>("/settings", data);
  return res.data.data;
}
