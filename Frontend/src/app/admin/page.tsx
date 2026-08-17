"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { getDashboard } from "@/lib/api/admin";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  unfulfilled: "Unfulfilled",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: getDashboard });

  return (
    <div>
      <h1 className="mb-8 font-heading text-headline-sm font-bold text-foreground">Dashboard</h1>

      {isLoading || !data ? (
        <div className="h-64 animate-pulse bg-muted" />
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border p-6">
              <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Revenue
              </p>
              <p className="font-heading text-headline-sm font-bold text-foreground">{formatPrice(data.revenue)}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Paid orders, all time</p>
            </div>
            <div className="border border-border p-6">
              <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Total Orders
              </p>
              <p className="font-heading text-headline-sm font-bold text-foreground">{data.totalOrders}</p>
            </div>
            {["unfulfilled", "processing"].map((status) => (
              <div key={status} className="border border-border p-6">
                <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  {STATUS_LABELS[status]}
                </p>
                <p className="font-heading text-headline-sm font-bold text-foreground">
                  {data.ordersByStatus[status] ?? 0}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-headline-sm font-bold text-foreground">Low Stock</h2>
                <Link href="/admin/products" className="text-[12px] text-muted-foreground underline">
                  View all products
                </Link>
              </div>
              {data.lowStock.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">Nothing low on stock right now.</p>
              ) : (
                <div className="divide-y divide-border border-t border-b border-border">
                  {data.lowStock.map((product) => (
                    <Link
                      key={product._id}
                      href={`/admin/products/${product._id}`}
                      className="flex items-center justify-between gap-4 py-3 text-[13px] hover:bg-muted"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <AlertTriangle className="size-3.5 shrink-0 text-destructive" strokeWidth={1.75} />
                        {product.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {product.sizes.map((s) => `${s.size}:${s.stock}`).join("  ")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 font-heading text-headline-sm font-bold text-foreground">Top Products</h2>
              {data.topProducts.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No sales yet.</p>
              ) : (
                <div className="divide-y divide-border border-t border-b border-border">
                  {data.topProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between gap-4 py-3 text-[13px]">
                      <span className="text-foreground">{product.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {product.quantitySold} sold · {formatPrice(product.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
