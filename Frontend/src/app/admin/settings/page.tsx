"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStoreSettingsClient, updateStoreSettings } from "@/lib/api/settings";

const inputClass =
  "w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground";
const labelClass = "mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-foreground uppercase";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: getStoreSettingsClient });

  const [currency, setCurrency] = useState("EGP");
  const [taxRatePercent, setTaxRatePercent] = useState("0");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("0");
  const [flatShippingRate, setFlatShippingRate] = useState("0");

  useEffect(() => {
    if (!settings) return;
    setCurrency(settings.currency);
    setTaxRatePercent(String(settings.taxRateBasisPoints / 100));
    setFreeShippingThreshold(String(settings.freeShippingThresholdMinorUnits / 100));
    setFlatShippingRate(String(settings.flatShippingRateMinorUnits / 100));
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      updateStoreSettings({
        currency,
        taxRateBasisPoints: Math.round(parseFloat(taxRatePercent || "0") * 100),
        freeShippingThresholdMinorUnits: Math.round(parseFloat(freeShippingThreshold || "0") * 100),
        flatShippingRateMinorUnits: Math.round(parseFloat(flatShippingRate || "0") * 100),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["settings"], updated);
      toast.success("Settings updated");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Could not update settings"),
  });

  return (
    <div>
      <h1 className="mb-8 font-heading text-headline-sm font-bold text-foreground">Store Settings</h1>

      {isLoading || !settings ? (
        <div className="h-64 max-w-lg animate-pulse bg-muted" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="max-w-lg space-y-5"
        >
          <div>
            <label className={labelClass}>Currency Code</label>
            <input required value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className={inputClass} maxLength={3} />
          </div>

          <div>
            <label className={labelClass}>Tax Rate (%)</label>
            <input type="number" min="0" step="0.01" value={taxRatePercent} onChange={(e) => setTaxRatePercent(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Flat Shipping Rate ({currency})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={flatShippingRate}
                onChange={(e) => setFlatShippingRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Free Shipping Threshold ({currency})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Orders at or above the threshold ship free automatically; below it, the flat rate applies.
          </p>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary px-8 py-3 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}
