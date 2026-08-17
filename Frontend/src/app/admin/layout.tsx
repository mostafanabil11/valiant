"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-(--spacing-container-max) gap-gutter px-margin-mobile pt-12 pb-stack-lg md:px-margin-desktop md:pt-16">
      <aside className="hidden w-56 shrink-0 md:block">
        <Link href="/" className="mb-8 block font-sans text-[26px] font-extrabold tracking-[0.15em] text-foreground">
          VALIANT
        </Link>
        <p className="mb-4 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">Admin</p>
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
