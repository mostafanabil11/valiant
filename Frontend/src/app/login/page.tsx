"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser } from "@/lib/api/auth";
import { GoogleIcon } from "@/components/icons/social-icons";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "profile"], user);
      toast.success(`Welcome back, ${user.firstName}`);
      router.push("/");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Invalid email or password");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate({ email, password });
  }

  return (
    <div className="grid min-h-[600px] grid-cols-1 md:grid-cols-2">
      {/* Photo */}
      <div className="relative hidden aspect-3/4 md:block">
        <Image
          src="/images/home/hero.jpg"
          alt="Valiant"
          fill
          className="object-cover"
          sizes="50vw"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center px-margin-mobile py-stack-xl md:px-margin-desktop">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 block text-center font-sans text-2xl font-bold tracking-[0.25em] text-foreground"
          >
            VALIANT
          </Link>

          <h1 className="mb-2 text-center font-heading text-headline-sm font-bold text-foreground">
            Welcome Back
          </h1>
          <p className="mb-8 text-center text-body-md text-muted-foreground">
            Sign in to access your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[12px] font-semibold tracking-[0.1em] text-foreground uppercase"
                >
                  Password
                </label>
                <Link href="/forgot-password" className="text-[12px] text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary py-4 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[12px] text-muted-foreground uppercase">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            className="flex w-full items-center justify-center gap-3 border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <GoogleIcon className="size-4" />
            Continue with Google
          </a>

          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-foreground underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
