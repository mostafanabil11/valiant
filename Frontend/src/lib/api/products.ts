import { apiClient } from "./client";
import type { Product, ProductDetail, ProductListParams, Pagination } from "@/types/product";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export async function getBestSellers(): Promise<Product[]> {
  const res = await apiClient.get<ApiEnvelope<Product[]>>("/products/best-sellers");
  return res.data.data;
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<{ items: Product[]; pagination: Pagination }> {
  const res = await apiClient.get<ApiListEnvelope<Product>>("/products", { params });
  return { items: res.data.data, pagination: res.data.pagination };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const res = await apiClient.get<ApiEnvelope<ProductDetail>>(`/products/${slug}`);
  return res.data.data;
}

export interface ProductSuggestion {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  discountPrice: number | null;
}

export async function getSuggestions(q: string): Promise<ProductSuggestion[]> {
  const res = await apiClient.get<ApiEnvelope<ProductSuggestion[]>>("/products/suggest", { params: { q } });
  return res.data.data;
}

export async function getProductColors(): Promise<string[]> {
  const res = await apiClient.get<ApiEnvelope<string[]>>("/products/colors");
  return res.data.data;
}

// --- Admin ---

export interface ProductInput {
  name: string;
  description?: string | null;
  color: string;
  styleGroup?: string | null;
  category: string;
  price: number;
  discountPrice?: number | null;
  images: string[];
  sizes: { size: ProductSizeInput["size"]; stock: number }[];
  isBestSeller?: boolean;
}

type ProductSizeInput = { size: "S" | "M" | "L" | "XL" | "2XL"; stock: number };

export interface StockMovement {
  _id: string;
  product: string;
  size: string;
  quantityChange: number;
  resultingStock: number;
  reason: string;
  reference: string | null;
  createdAt: string;
}

export async function getAdminProducts(
  params: ProductListParams = {},
): Promise<{ items: Product[]; pagination: Pagination }> {
  const res = await apiClient.get<ApiListEnvelope<Product>>("/products/admin", { params });
  return { items: res.data.data, pagination: res.data.pagination };
}

export async function getAdminProduct(id: string): Promise<Product> {
  const res = await apiClient.get<ApiEnvelope<Product>>(`/products/admin/${id}`);
  return res.data.data;
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const res = await apiClient.post<ApiEnvelope<Product>>("/products", data);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<ProductInput> & { isActive?: boolean }): Promise<Product> {
  const res = await apiClient.patch<ApiEnvelope<Product>>(`/products/${id}`, data);
  return res.data.data;
}

export async function deactivateProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function getStockMovements(productId: string): Promise<StockMovement[]> {
  const res = await apiClient.get<ApiEnvelope<StockMovement[]>>(`/products/${productId}/stock-movements`);
  return res.data.data;
}

export async function bulkAdjustStock(
  lines: { productId: string; size: ProductSizeInput["size"]; quantityChange: number }[],
): Promise<{ productId: string; size: string; quantityChange: number; success: boolean; error?: string }[]> {
  const res = await apiClient.post<
    ApiEnvelope<{ productId: string; size: string; quantityChange: number; success: boolean; error?: string }[]>
  >("/products/stock/bulk-adjust", { lines });
  return res.data.data;
}

// --- Server-side (Server Components only) ---
// Uses native fetch, not the axios client above, because only fetch hooks
// into Next's request-deduping and next:{revalidate} caching (axios calls
// go through Node's http module directly and bypass that layer entirely).

export async function getProductBySlugServer(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product "${slug}": ${res.status}`);
  const body: ApiEnvelope<ProductDetail> = await res.json();
  return body.data;
}

export async function getAllProductSlugsServer(): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body: ApiListEnvelope<Product> = await res.json();
    return body.data.map((p) => p.slug);
  } catch {
    // API unreachable (e.g. at build time) — fall back to on-demand rendering
    // for all product pages instead of failing the whole build.
    return [];
  }
}
