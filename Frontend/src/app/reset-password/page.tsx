import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordContent } from "./reset-password-content";

export const metadata: Metadata = {
  title: "Reset Password — Valiant",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
