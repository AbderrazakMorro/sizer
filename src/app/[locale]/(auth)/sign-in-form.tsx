
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocale, useTranslations } from "next-intl";
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
import { pushLogin } from "@/lib/gtm";
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from "lucide-react";

type SignInValues = { email: string; password: string };

export function SignInForm() {
  const t = useTranslations("SignIn");
  const locale = useLocale();
  const isFr = locale === "fr";
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const emailUpdated = searchParams.get("email_updated");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [step, setStep] = useState<"email" | "verify">("email");
  const [resetLoading, setResetLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const signInSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    password: z
      .string()
      .min(1, isFr ? "Le mot de passe est requis" : "Password is required"),
  });

  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  useEffect(() => {
    if (emailUpdated !== "1") return;
    const supabase = getSupabaseClient();
    supabase.auth.signOut().then(() => {
      toast.success(t("toastEmailUpdated"));
    });
  }, [emailUpdated, t]);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const watchedEmail = form.watch("email");
  const emailTrimmed = watchedEmail?.trim() ?? "";
  const isEmailValid =
    emailTrimmed.length > 0 &&
    z.string().email().safeParse(emailTrimmed).success;
  const watchedPassword = form.watch("password") ?? "";

  async function onSubmit(values: SignInValues) {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password || "",
      });
      if (error) throw error;
      pushLogin({ method: "password" });
      toast.success(isFr ? "Connexion réussie !" : "Sign in successful!");
      const finalRedirect = redirectTo || appPath("/dashboard");
      window.location.href = finalRedirect;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : t("toastError");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordRequest(e: React.FormEvent) {
    e.preventDefault();
    setOtpError(null);
    setOtp("");
    if (!emailTrimmed || !isEmailValid) {
      toast.error(
        isFr
          ? "Veuillez entrer une adresse email valide"
          : "Please enter a valid email address"
      );
      return;
    }
    setResetLoading(true);
    try {
      const { sendResetPasswordEmail } = await import(
        "@/app/actions/auth-actions"
      );
      const result = await sendResetPasswordEmail(emailTrimmed, locale);
      if (result.success) {
        toast.success(
          isFr
            ? "Si l'adresse email existe, un code de réinitialisation a été envoyé."
            : "If the email address exists, a reset code has been sent."
        );
        setOtpSent(true);
        setStep("verify");
      } else {
        toast.error(
          result.error || (isFr ? "Une erreur est survenue" : "An error occurred")
        );
      }
    } catch (err: any) {
      toast.error(
        err.message || (isFr ? "Une erreur est survenue" : "An error occurred")
      );
    } finally {
      setResetLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setOtpError(null);
    const trimmed = otp.trim();
    if (!/^[0-9]{6}$/.test(trimmed)) {
      setOtpError(
        isFr ? "Veuillez entrer un code à 6 chiffres" : "Enter the 6-digit code"
      );
      return;
    }
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, code: trimmed, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOtpError(data?.error || (isFr ? "Code invalide" : "Invalid code"));
        return;
      }
      const recoveryUrl = data?.recoveryUrl;
      if (!recoveryUrl) {
        setOtpError(
          isFr ? "Impossible de générer le lien" : "Unable to generate link"
        );
        return;
      }
      window.location.href = recoveryUrl;
    } catch (err: any) {
      setOtpError(
        err?.message || (isFr ? "Une erreur est survenue" : "An error occurred")
      );
    } finally {
      setVerifyLoading(false);
    }
  }

  /* ─── Forgot-password UI ──────────────────────────────── */
  if (isForgotPasswordMode) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-6">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(212,168,80,0.12)",
                border: "1px solid rgba(212,168,80,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyRound style={{ width: 18, height: 18, color: "#d4a850" }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isFr ? "Mot de passe oublié" : "Reset your password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "email"
              ? isFr
                ? "Entrez votre e-mail pour recevoir un code de réinitialisation."
                : "Enter your email to receive a reset code."
              : isFr
              ? "Entrez le code à 6 chiffres envoyé à votre email."
              : "Enter the 6-digit code sent to your email."}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              if (step === "email") return void handleResetPasswordRequest(e);
              return void handleVerifyCode(e);
            }}
            className="space-y-5"
          >
            {step === "email" ? (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("emailLabel")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className="pl-10 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3 pt-1">
                  <Button
                    type="submit"
                    className="flex-1 h-11 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #c49a30 0%, #e8b84b 50%, #c49a30 100%)",
                      color: "#1a1000",
                    }}
                    disabled={resetLoading || !isEmailValid}
                  >
                    {resetLoading
                      ? isFr
                        ? "Envoi…"
                        : "Sending…"
                      : isFr
                      ? "Envoyer le code"
                      : "Send code"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => {
                      setIsForgotPasswordMode(false);
                      setStep("email");
                    }}
                  >
                    {isFr ? "Retour" : "Back"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {otpSent && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "rgba(212,168,80,0.08)",
                      border: "1px solid rgba(212,168,80,0.2)",
                      fontSize: 13,
                      color: "rgba(212,168,80,0.9)",
                    }}
                  >
                    {isFr
                      ? "Code envoyé ! Saisissez-le ci-dessous pour continuer."
                      : "Code sent! Enter it below to continue."}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isFr ? "Code de vérification" : "Verification code"}
                  </label>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      const next = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(next);
                    }}
                    className="tracking-[0.6em] text-center h-14 text-xl font-bold"
                  />
                  {otpError && (
                    <p className="text-sm text-destructive">{otpError}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    type="submit"
                    className="flex-1 h-11 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #c49a30 0%, #e8b84b 50%, #c49a30 100%)",
                      color: "#1a1000",
                    }}
                    disabled={verifyLoading}
                  >
                    {verifyLoading
                      ? isFr
                        ? "Vérification…"
                        : "Verifying…"
                      : isFr
                      ? "Vérifier le code"
                      : "Verify code"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setOtpError(null);
                    }}
                  >
                    {isFr ? "Changer" : "Change"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </div>
    );
  }

  /* ─── Normal sign-in UI ───────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
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
          {isFr ? "Bienvenue" : "Welcome back"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground pt-1">
          {redirectTo
            ? t("descriptionSessionExpired")
            : isFr
            ? "Entrez vos identifiants pour accéder à votre espace."
            : "Enter your credentials to access your workspace."}
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-5"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t("emailLabel")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      className="pl-10 h-11"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center mb-1.5">
                  <FormLabel className="text-sm font-medium">
                    {isFr ? "Mot de passe" : "Password"}
                  </FormLabel>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordMode(true)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: "#d4a850" }}
                  >
                    {isFr ? "Mot de passe oublié ?" : "Forgot password?"}
                  </button>
                </div>
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            id="sign-in-submit"
            type="submit"
            size="lg"
            className="w-full h-11 font-semibold text-sm group"
            style={{
              background:
                "linear-gradient(135deg, #c49a30 0%, #e8b84b 50%, #c49a30 100%)",
              color: "#1a1000",
            }}
            disabled={
              loading || !isEmailValid || watchedPassword.length === 0
            }
          >
            <span>{loading ? t("submitting") : isFr ? "Se connecter" : "Sign In"}</span>
            {!loading && (
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground/60">
            {isFr ? "Nouveau sur Veta ?" : "New to Veta?"}
          </span>
        </div>
      </div>

      {/* Sign-up link */}
      <Link
        href="/sign-up"
        className="flex items-center justify-center gap-1.5 w-full h-11 rounded-lg border border-border/60 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
      >
        {t("noAccount")}
      </Link>
    </div>
  );
}
