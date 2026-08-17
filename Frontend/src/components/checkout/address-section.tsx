"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAddress } from "@/lib/api/addresses";
import { EGYPT_GOVERNORATES, type Address, type EgyptGovernorate } from "@/types/address";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  addressLine: "",
  city: "",
  governorate: "Cairo" as EgyptGovernorate,
  postalCode: "",
};

export function AddressSection({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (address) => {
      queryClient.setQueryData<Address[]>(["addresses"], (prev) => [...(prev ?? []), address]);
      onSelect(address._id);
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast.success("Address added");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Could not save address"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      addressLine: form.addressLine,
      city: form.city,
      governorate: form.governorate,
      postalCode: form.postalCode || null,
      isDefault: addresses.length === 0,
    });
  }

  const inputClass =
    "w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground";
  const labelClass = "mb-2 block text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase";

  return (
    <section>
      <h2 className="mb-6 font-heading text-headline-sm font-bold text-foreground">Delivery</h2>

      {addresses.length > 0 && (
        <div role="radiogroup" aria-label="Saved addresses" className="mb-6 space-y-3">
          {addresses.map((address) => (
            <button
              key={address._id}
              type="button"
              role="radio"
              aria-checked={selectedId === address._id}
              onClick={() => onSelect(address._id)}
              className={`block w-full border p-4 text-left text-sm transition-colors ${
                selectedId === address._id ? "border-foreground" : "border-border hover:border-foreground/50"
              }`}
            >
              <p className="font-medium text-foreground">
                {address.firstName} {address.lastName}
                {address.isDefault && (
                  <span className="ml-2 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                    Default
                  </span>
                )}
              </p>
              <p className="mt-1 text-muted-foreground">
                {address.addressLine}, {address.city}, {address.governorate}
              </p>
              <p className="text-muted-foreground">{address.phone}</p>
            </button>
          ))}

          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-[13px] font-semibold text-foreground underline"
            >
              + Add a new address
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="addressLine">Address</label>
            <input
              id="addressLine"
              required
              value={form.addressLine}
              onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="city">City</label>
              <input
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="governorate">Governorate</label>
              <select
                id="governorate"
                required
                value={form.governorate}
                onChange={(e) => setForm((f) => ({ ...f, governorate: e.target.value as EgyptGovernorate }))}
                className={inputClass}
              >
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="postalCode">Postal Code (optional)</label>
              <input
                id="postalCode"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary px-6 py-3 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving…" : "Save Address"}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-button font-medium tracking-[0.05em] text-foreground uppercase transition-colors hover:opacity-70"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
