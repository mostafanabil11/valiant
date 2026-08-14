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
