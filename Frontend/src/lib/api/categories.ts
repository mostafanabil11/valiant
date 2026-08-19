import { apiClient } from "./client";
import type { Category } from "@/types/category";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getCategoryTree(): Promise<Category[]> {
  const res = await apiClient.get<ApiEnvelope<Category[]>>("/categories");
  return res.data.data;
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiEnvelope<Category[]>>("/categories/featured");
  return res.data.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const res = await apiClient.get<ApiEnvelope<Category>>(`/categories/${slug}`);
  return res.data.data;
}

// --- Admin ---

export interface CategoryInput {
  name: string;
  parent?: string | null;
  image?: string | null;
  description?: string | null;
  displayOrder?: number;
  isFeaturedOnHome?: boolean;
  isActive?: boolean;
}

export async function getAdminCategoryTree(): Promise<Category[]> {
  const res = await apiClient.get<ApiEnvelope<Category[]>>("/categories/admin/tree");
  return res.data.data;
}

export async function createCategory(data: CategoryInput): Promise<Category> {
  const res = await apiClient.post<ApiEnvelope<Category>>("/categories", data);
  return res.data.data;
}

export async function updateCategory(id: string, data: Partial<CategoryInput>): Promise<Category> {
  const res = await apiClient.patch<ApiEnvelope<Category>>(`/categories/${id}`, data);
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function reorderCategories(items: { id: string; displayOrder: number }[]): Promise<void> {
  await apiClient.patch("/categories/reorder", { items });
}

export async function getChildCategoryBySlug(
  parentSlug: string,
  childSlug: string,
): Promise<Category> {
  const res = await apiClient.get<ApiEnvelope<Category>>(`/categories/${parentSlug}/${childSlug}`);
  return res.data.data;
}

// --- Server-side (Server Components only) — see products.ts for why native
// fetch is used here instead of the axios client above.

export async function getCategoryBySlugServer(slug: string): Promise<Category | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch category "${slug}": ${res.status}`);
  const body: ApiEnvelope<Category> = await res.json();
  return body.data;
}

export async function getTopLevelCategorySlugsServer(): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body: ApiEnvelope<Category[]> = await res.json();
    return body.data.map((c) => c.slug);
  } catch {
    // API unreachable (e.g. at build time) — fall back to on-demand rendering
    // for all category pages instead of failing the whole build.
    return [];
  }
}

export async function getCategoryTreeServer(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body: ApiEnvelope<Category[]> = await res.json();
    return body.data;
  } catch {
    return [];
  }
}

export async function getChildCategoryBySlugServer(parentSlug: string, childSlug: string): Promise<Category | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${parentSlug}/${childSlug}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch child category "${childSlug}": ${res.status}`);
  const body: ApiEnvelope<Category> = await res.json();
  return body.data;
}
