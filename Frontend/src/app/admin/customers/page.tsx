"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/lib/api/admin";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", page, q],
    queryFn: () => getCustomers({ page, limit: 20, q: q.trim() || undefined }),
  });

  return (
    <div>
      <h1 className="mb-8 font-heading text-headline-sm font-bold text-foreground">Customers</h1>

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        placeholder="Search by name or email…"
        className="mb-6 w-full max-w-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground"
      />

      {isLoading || !data ? (
        <div className="h-64 animate-pulse bg-muted" />
      ) : data.items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No customers found.</p>
      ) : (
        <>
          <div className="divide-y divide-border border-t border-b border-border">
            {data.items.map((customer) => (
              <div key={customer._id} className="flex items-center justify-between gap-4 py-3 text-[13px]">
                <div>
                  <p className="font-medium text-foreground">
                    {customer.firstName} {customer.lastName}
                    {customer.role === "admin" && (
                      <span className="ml-2 border border-foreground px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">{customer.email}</p>
                </div>
                <div className="text-right text-[12px] text-muted-foreground">
                  <p>{customer.authProvider === "google" ? "Google" : "Email/Password"}</p>
                  <p>{customer.isEmailVerified ? "Verified" : "Unverified"}</p>
                </div>
              </div>
            ))}
          </div>

          {data.pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4 text-[13px]">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-muted-foreground underline disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="text-muted-foreground underline disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
