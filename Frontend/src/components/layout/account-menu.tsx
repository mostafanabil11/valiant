"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User, Package, Settings, LogOut, ShieldCheck, Heart } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logoutUser } from "@/lib/api/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await logoutUser();
    } catch {
      // Even if the API call fails, clear local state so the UI doesn't
      // strand the user in a signed-in-looking state.
    }
    queryClient.setQueryData(["auth", "profile"], null);
    queryClient.removeQueries({ queryKey: ["cart", "server"] });
    toast.success("Signed out");
    router.push("/");
  }

  if (isLoading) {
    return <span className={className} aria-hidden />;
  }

  if (!user) {
    return (
      <Link href="/login" aria-label="Account" className={className}>
        {iconOnly ? <User className="size-5" strokeWidth={1.5} /> : "Account"}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button type="button" aria-label="Account menu" className={className} />}
      >
        {iconOnly ? <User className="size-5" strokeWidth={1.5} /> : `Hi, ${user.firstName}`}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12}>
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">{user.email}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account/orders" />}>
          <Package className="size-4" strokeWidth={1.5} />
          Order History
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/wishlist" />}>
          <Heart className="size-4" strokeWidth={1.5} />
          Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/settings" />}>
          <Settings className="size-4" strokeWidth={1.5} />
          Account Settings
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck className="size-4" strokeWidth={1.5} />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut className="size-4" strokeWidth={1.5} />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
