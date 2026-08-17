import { apiClient } from "./client";
import type { StoreSettings } from "@/types/settings";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Server-side only (used from Server Components like SiteHeader) — settings
// change rarely, so this is revalidated hourly rather than fetched on every request.
export async function getStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
    next: { revalidate: 3600 },
  });
  const body: ApiEnvelope<StoreSettings> = await res.json();
  return body.data;
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
