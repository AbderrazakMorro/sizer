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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function SetPasswordForm() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const schema = z
    .object({
      password: z
        .string()
        .min(
          6,
          isFr
            ? "Le mot de passe doit contenir au moins 6 caractères"
            : "Password must be at least 6 characters"
        ),
      confirmPassword: z
        .string()
        .min(
          6,
          isFr
            ? "La confirmation doit contenir au moins 6 caractères"
            : "Password confirmation must be at least 6 characters"
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: isFr
        ? "Les mots de passe ne correspondent pas"
        : "Passwords do not match",
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

    if (resetSessionId) {
      setHasSession(true);
      setCheckingSession(false);
      return;
    }

    let isSettingSession = false;

    const hash = window.location.hash?.slice(1) ?? "";
    const hashParams = hash
      ? new URLSearchParams(hash)
      : new URLSearchParams();
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        setHasSession(true);
        setCheckingSession(false);
      } else if (!isSettingSession) {
        setHasSession(false);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const url = new URL(window.location.href);
      const reset_session_id =
        url.searchParams.get("reset_session_id") || "";

      if (!reset_session_id) {
        toast.error(
          isFr ? "Lien de réinitialisation invalide" : "Invalid reset link"
        );
        return;
      }

      const res = await fetch(`/api/auth/reset-password/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_session_id,
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          data?.error ||
            (isFr
              ? "Impossible de définir le mot de passe"
              : "Unable to set password")
        );
        return;
      }

      toast.success(
        isFr
          ? "Mot de passe défini avec succès !"
          : "Password set successfully!"
      );
      toast.success(
        isFr
          ? "Vous allez être redirigé vers votre espace..."
          : "Redirecting you to your workspace..."
      );

      window.location.href = appPath("/dashboard");
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : isFr
          ? "Une erreur est survenue"
          : "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Checking session state ──────────────────────────── */
  if (checkingSession) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(212,168,80,0.1)",
              border: "1px solid rgba(212,168,80,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Loader2
              style={{
                width: 20,
                height: 20,
                color: "#d4a850",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isFr ? "Vérification de la session…" : "Verifying session…"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFr
              ? "Veuillez patienter un instant."
              : "Please wait a moment."}
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background: "rgba(212,168,80,0.2)",
                animation: `pulse ${0.6 + i * 0.2}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── No / expired session ────────────────────────────── */
  if (!hasSession) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <AlertCircle style={{ width: 20, height: 20, color: "#ef4444" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive">
            {isFr ? "Session expirée ou invalide" : "Session expired or invalid"}
          </h1>
          <p className="text-sm text-muted-foreground pt-1">
            {isFr
              ? "Votre lien de connexion a expiré ou est invalide. Veuillez vous connecter pour accéder à votre espace."
              : "Your login link has expired or is invalid. Please sign in to access your space."}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="w-full h-11 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, #c49a30 0%, #e8b84b 50%, #c49a30 100%)",
            color: "#1a1000",
          }}
        >
          <Link href={`/${locale}/sign-in` as any}>
            {isFr ? "Aller à la page de connexion" : "Go to Sign In"}
          </Link>
        </Button>
        <Link
          href={`/${locale}` as any}
          className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isFr ? "Retour à l'accueil" : "Back to Home"}
        </Link>
      </div>
    );
  }

  const watchedPassword = form.watch("password") ?? "";
  const watchedConfirmPassword = form.watch("confirmPassword") ?? "";
  const passwordScore = Math.min(4, Math.floor(watchedPassword.length / 3));
  const passwordsMatch =
    watchedConfirmPassword.length > 0 &&
    watchedPassword === watchedConfirmPassword;

  /* ── Set password form ───────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(212,168,80,0.1)",
            border: "1px solid rgba(212,168,80,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <ShieldCheck style={{ width: 20, height: 20, color: "#d4a850" }} />
        </div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#d4a850",
            marginBottom: 10,
          }}
        >
          {isFr ? "Sécurité du compte" : "Account security"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {isFr ? "Définir votre mot de passe" : "Set your password"}
        </h1>
        <p className="text-sm text-muted-foreground pt-1">
          {isFr
            ? "Choisissez un mot de passe fort pour sécuriser votre compte."
            : "Choose a strong password to secure your account."}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-5"
        >
          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {isFr ? "Nouveau mot de passe" : "New password"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
                {/* Strength bar */}
                {watchedPassword.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              i <= passwordScore
                                ? passwordScore <= 1
                                  ? "#ef4444"
                                  : passwordScore === 2
                                  ? "#f59e0b"
                                  : passwordScore === 3
                                  ? "#84cc16"
                                  : "#22c55e"
                                : "rgba(120,120,120,0.2)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordScore <= 1
                        ? isFr
                          ? "Faible"
                          : "Weak"
                        : passwordScore === 2
                        ? isFr
                          ? "Moyen"
                          : "Fair"
                        : passwordScore === 3
                        ? isFr
                          ? "Bon"
                          : "Good"
                        : isFr
                        ? "Fort"
                        : "Strong"}
                    </p>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {isFr ? "Confirmer le mot de passe" : "Confirm password"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                      style={{
                        borderColor:
                          watchedConfirmPassword.length > 0
                            ? passwordsMatch
                              ? "rgba(34,197,94,0.5)"
                              : "rgba(239,68,68,0.5)"
                            : undefined,
                      }}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
                {passwordsMatch && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {isFr
                      ? "Les mots de passe correspondent"
                      : "Passwords match"}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            id="set-password-submit"
            type="submit"
            size="lg"
            className="w-full h-11 font-semibold text-sm group mt-2"
            style={{
              background:
                "linear-gradient(135deg, #c49a30 0%, #e8b84b 50%, #c49a30 100%)",
              color: "#1a1000",
            }}
            disabled={
              loading ||
              watchedPassword.length < 6 ||
              watchedConfirmPassword.length < 6
            }
          >
            <span>
              {loading
                ? isFr
                  ? "Mise à jour…"
                  : "Updating…"
                : isFr
                ? "Accéder à mon espace"
                : "Access my workspace"}
            </span>
            {!loading && (
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            )}
          </Button>
        </form>
      </Form>

      {/* Back link */}
      <Link
        href={`/${locale}` as any}
        className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isFr ? "Retour à l'accueil" : "Back to Home"}
      </Link>
    </div>
  );
}
