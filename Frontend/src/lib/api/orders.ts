import { apiClient } from "./client";
import type { Order, OrderSummary } from "@/types/order";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CheckoutResponse {
  order: Order;
  // Present only for card orders — the fully-formed provider URL to embed.
  // The frontend never builds this URL itself, so provider details stay
  // server-side and can change without a frontend release.
  payment?: {
    iframeUrl: string;
    expiresAt: string;
  };
}

export async function checkout(
  addressId: string,
  idempotencyKey: string,
  paymentMethod: "cod" | "card" = "cod",
  couponCode?: string | null,
): Promise<CheckoutResponse> {
  const res = await apiClient.post<
    ApiEnvelope<Order> & { payment?: { iframeUrl: string; expiresAt: string } }
  >("/orders/checkout", {
    addressId,
    idempotencyKey,
    paymentMethod,
    ...(couponCode ? { couponCode } : {}),
  });
  return {
    order: res.data.data,
    payment: res.data.payment,
  };
}

export interface PaymentStatus {
  orderNumber: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  fulfillmentStatus: string;
  expiresAt: string | null;
}

export async function getPaymentStatus(orderNumber: string): Promise<PaymentStatus> {
  const res = await apiClient.get<ApiEnvelope<PaymentStatus>>(`/orders/${orderNumber}/payment-status`);
  return res.data.data;
}

export async function getOrders(): Promise<OrderSummary[]> {
  const res = await apiClient.get<ApiEnvelope<OrderSummary[]>>("/orders");
  return res.data.data;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const res = await apiClient.get<ApiEnvelope<Order>>(`/orders/${orderNumber}`);
  return res.data.data;
}

export async function cancelOrder(orderNumber: string): Promise<Order> {
  const res = await apiClient.post<ApiEnvelope<Order>>(`/orders/${orderNumber}/cancel`);
  return res.data.data;
}

// --- Admin ---

export interface AdminOrderListItem {
  _id: string;
  orderNumber: string;
  user: { _id: string; firstName: string; lastName: string; email: string } | null;
  items: Order["items"];
  total: number;
  currency: string;
  paymentMethod: "cod" | "card";
  paymentStatus: Order["paymentStatus"];
  fulfillmentStatus: Order["fulfillmentStatus"];
  trackingNumber: string | null;
  createdAt: string;
}

export interface AdminOrderQuery {
  paymentStatus?: Order["paymentStatus"];
  fulfillmentStatus?: Order["fulfillmentStatus"];
  page?: number;
  limit?: number;
}

interface ApiListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function getAdminOrders(
  params: AdminOrderQuery = {},
): Promise<{ items: AdminOrderListItem[]; pagination: ApiListEnvelope<AdminOrderListItem>["pagination"] }> {
  const res = await apiClient.get<ApiListEnvelope<AdminOrderListItem>>("/orders/admin", { params });
  return { items: res.data.data, pagination: res.data.pagination };
}

export async function getAdminOrder(orderNumber: string): Promise<Order & { user: AdminOrderListItem["user"] }> {
  const res = await apiClient.get<ApiEnvelope<Order & { user: AdminOrderListItem["user"] }>>(
    `/orders/admin/${orderNumber}`,
  );
  return res.data.data;
}

export async function updateOrderStatus(
  orderNumber: string,
  data: { fulfillmentStatus?: "shipped" | "delivered"; paymentStatus?: "refunded"; trackingNumber?: string },
): Promise<Order> {
  const res = await apiClient.patch<ApiEnvelope<Order>>(`/orders/${orderNumber}/status`, data);
  return res.data.data;
}
