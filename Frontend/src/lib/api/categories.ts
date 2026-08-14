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

export async function getChildCategoryBySlug(
  parentSlug: string,
  childSlug: string,
): Promise<Category> {
  const res = await apiClient.get<ApiEnvelope<Category>>(`/categories/${parentSlug}/${childSlug}`);
  return res.data.data;
}
