"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getSupabaseClient } from "@/lib/supabase";
import { appPath } from "@/lib/app-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export function SetPasswordForm() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const schema = z.object({
    password: z.string().min(6, isFr ? "Le mot de passe doit contenir au moins 6 caractères" : "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, isFr ? "La confirmation doit contenir au moins 6 caractères" : "Password confirmation must be at least 6 characters"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: isFr ? "Les mots de passe ne correspondent pas" : "Passwords do not match",
    path: ["confirmPassword"],
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    const url = new URL(window.location.href);
    const resetSessionId = url.searchParams.get("reset_session_id");

    // If we are in our custom OTP flow, we should NOT require a Supabase session.
    // The backend validates reset_session_id server-side.
    if (resetSessionId) {
      setHasSession(true);
      setCheckingSession(false);
      return;
    }

    // Supabase recovery links may provide tokens either in the URL hash
    // (#access_token=...&refresh_token=...) OR as query parameters
    // (?access_token=...&refresh_token=...).
    let isSettingSession = false;

    const hash = window.location.hash?.slice(1) ?? "";
    const hashParams = hash ? new URLSearchParams(hash) : new URLSearchParams();

    const queryParams = url.searchParams ?? new URLSearchParams();

    const accessToken =
      hashParams.get("access_token") ?? queryParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") ?? queryParams.get("refresh_token");

    if (accessToken && refreshToken) {
      isSettingSession = true;
      setCheckingSession(true);
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data }: { data: any }) => {
          if (data?.session) {
            setHasSession(true);
          } else {
            setHasSession(false);
          }
        })
        .catch(() => {
          setHasSession(false);
        })
        .finally(() => {
          setCheckingSession(false);
        });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        if (session) {
          setHasSession(true);
          setCheckingSession(false);
        } else if (!isSettingSession) {
          setHasSession(false);
          setCheckingSession(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const url = new URL(window.location.href);
      const reset_session_id = url.searchParams.get("reset_session_id") || "";

      if (!reset_session_id) {
        toast.error(
          isFr
            ? "Lien de réinitialisation invalide"
            : "Invalid reset link"
        );
        return;
      }

      const res = await fetch(`/api/auth/reset-password/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_session_id, password: values.password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || (isFr ? "Impossible de définir le mot de passe" : "Unable to set password"));
        return;
      }

      toast.success(
        isFr ? "Mot de passe défini avec succès !" : "Password set successfully!"
      );
      toast.success(
        isFr
          ? "Vous allez être redirigé vers votre espace..."
          : "Redirecting you to your workspace..."
      );

      window.location.href = appPath("/dashboard");
    } catch (error: any) {
      const message = error instanceof Error ? error.message : (isFr ? "Une erreur est survenue" : "An error occurred");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }


  if (checkingSession) {
    return (
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl leading-none font-semibold tracking-tight">
            {isFr ? "Vérification de la session..." : "Verifying session..."}
          </h1>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasSession) {
    return (
      <Card className="w-full border-destructive/20">
        <CardHeader>
          <h1 className="text-2xl leading-none font-semibold tracking-tight text-destructive">
            {isFr ? "Session expirée ou invalide" : "Session expired or invalid"}
          </h1>
          <CardDescription>
            {isFr
              ? "Votre lien de connexion a expiré ou est invalide. Veuillez vous connecter pour accéder à votre espace."
              : "Your login link has expired or is invalid. Please sign in to access your space."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link
              href={`/${locale}/sign-in` as any}
            >
              {isFr ? "Aller à la page de connexion" : "Go to Sign In"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const watchedPassword = form.watch("password") ?? "";
  const watchedConfirmPassword = form.watch("confirmPassword") ?? "";

  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl leading-none font-semibold tracking-tight">
          {isFr ? "Définir votre mot de passe" : "Set your password"}
        </h1>
        <CardDescription>
          {isFr
            ? "Pour sécuriser votre compte et accéder à votre espace client, veuillez choisir un mot de passe."
            : "To secure your account and access your client space, please choose a password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isFr ? "Mot de passe" : "Password"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isFr ? "Confirmer le mot de passe" : "Confirm Password"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full bg-foreground text-background hover:bg-gold hover:text-white transition-colors"
              disabled={loading || watchedPassword.length < 6 || watchedConfirmPassword.length < 6}
            >
              {loading ? (isFr ? "Mise à jour..." : "Updating...") : (isFr ? "Accéder à mon espace" : "Access my workspace")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Link
          href={(`/${locale}` as unknown) as any}
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors w-full"
        >
          {isFr ? "Retour à l'accueil" : "Back to Home"}
        </Link>
      </CardFooter>
    </Card>
  );
}
