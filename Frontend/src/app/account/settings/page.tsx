"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { updateProfile, changePassword } from "@/lib/api/auth";

export default function AccountSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login?next=/account/settings");
    }
  }, [userLoading, user, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: () => updateProfile({ firstName, lastName }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["auth", "profile"], updated);
      toast.success("Profile updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Could not update profile");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "profile"], null);
      toast.success("Password changed — please sign in again");
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Could not change password");
    },
  });

  if (userLoading || !user) {
    return null;
  }

  const isGoogleAccount = user.authProvider === "google";

  return (
    <div className="mx-auto w-full max-w-(--spacing-container-max) px-margin-mobile py-stack-xl md:px-margin-desktop">
      <Link href="/account/orders" className="mb-6 inline-block text-[13px] text-muted-foreground underline">
        ← Back to order history
      </Link>

      <h1 className="mb-10 font-heading text-headline-sm font-bold text-foreground md:text-headline-md">
        Account Settings
      </h1>

      <div className="mx-auto max-w-md space-y-12">
        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="mb-1 font-heading text-headline-sm font-bold text-foreground">
            Profile
          </h2>
          <p className="mb-6 text-[13px] text-muted-foreground">{user.email}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              profileMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileMutation.isPending || (!firstName.trim() || !lastName.trim())}
              className="bg-primary px-8 py-3 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileMutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>

        <section aria-labelledby="password-heading">
          <h2 id="password-heading" className="mb-1 font-heading text-headline-sm font-bold text-foreground">
            Password
          </h2>

          {isGoogleAccount ? (
            <p className="text-[13px] text-muted-foreground">
              You sign in with Google, so there&apos;s no separate password to change here.
            </p>
          ) : (
            <>
              <p className="mb-6 text-[13px] text-muted-foreground">
                Changing your password will sign you out everywhere, including this device.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  passwordMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase"
                  >
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                  />
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    At least 6 characters, with an uppercase letter, a lowercase letter, and a number.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={passwordMutation.isPending || !currentPassword || !newPassword}
                  className="bg-primary px-8 py-3 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {passwordMutation.isPending ? "Changing…" : "Change Password"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
