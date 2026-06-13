import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SetPasswordForm } from "./set-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  return {
    title: isFr ? "Définir votre mot de passe - Veta" : "Set your password - Veta",
    description: isFr ? "Définissez un mot de passe pour accéder à votre espace." : "Set a password to access your workspace.",
    alternates: { canonical: "/set-password" },
    robots: { index: false, follow: false },
  };
}

function SetPasswordFormFallback() {
  return (
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<SetPasswordFormFallback />}>
      <SetPasswordForm />
    </Suspense>
  );
}
