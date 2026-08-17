import { apiClient } from "./client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  lowStock: { _id: string; name: string; slug: string; sizes: { size: string; stock: number }[] }[];
  topProducts: {
    _id: string;
    name: string;
    slug: string;
    image: string | null;
    quantitySold: number;
    revenue: number;
  }[];
}

export async function getDashboard(): Promise<DashboardStats> {
  const res = await apiClient.get<ApiEnvelope<DashboardStats>>("/admin/dashboard");
  return res.data.data;
}

export interface Customer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  authProvider: "local" | "google";
  createdAt: string;
}

export async function getCustomers(
  params: { q?: string; page?: number; limit?: number } = {},
): Promise<{ items: Customer[]; pagination: ApiListEnvelope<Customer>["pagination"] }> {
  const res = await apiClient.get<ApiListEnvelope<Customer>>("/admin/customers", { params });
  return { items: res.data.data, pagination: res.data.pagination };
}

export interface AuditLogEntry {
  _id: string;
  admin: string | null;
  adminEmail: string | null;
  action: string;
  params: unknown;
  body: unknown;
  resultSummary: { id?: string; count?: number } | null;
  createdAt: string;
}

export async function getAuditLog(
  params: { action?: string; page?: number; limit?: number } = {},
): Promise<{ items: AuditLogEntry[]; pagination: ApiListEnvelope<AuditLogEntry>["pagination"] }> {
  const res = await apiClient.get<ApiListEnvelope<AuditLogEntry>>("/admin/audit-log", { params });
  return { items: res.data.data, pagination: res.data.pagination };
}
