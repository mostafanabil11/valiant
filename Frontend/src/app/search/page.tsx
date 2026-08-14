import { Suspense } from "react";
import { SearchContent } from "./search-content";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
