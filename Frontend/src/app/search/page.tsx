import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchContent } from "./search-content";

export const metadata: Metadata = {
  title: "Search — Valiant",
  // Query-driven results pages aren't worth indexing individually.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
