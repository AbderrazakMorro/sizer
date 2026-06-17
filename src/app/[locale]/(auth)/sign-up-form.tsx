"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { appPath } from "@/lib/app-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { pushSignUp } from "@/lib/gtm";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

const VALID_PLAN_CODES = ["BASE", "PRO", "STUDIO"] as const;
type PlanCode = (typeof VALID_PLAN_CODES)[number];

type SignUpValues = {
  email: string;
  password: string;
  fullName?: string;
  acceptTerms: boolean;
};

type SignUpFormProps = {
  redirectTo?: string | null;
  planParam?: string | null;
  billingParam?: string | null;
};

export function SignUpForm({
  redirectTo = null,
  planParam = null,
  billingParam = null,
}: SignUpFormProps) {
  const t = useTranslations("SignUp");
  const locale = useLocale();
  const isFr = locale === "fr";
  const planFromUrl: PlanCode | null =
    planParam && VALID_PLAN_CODES.includes(planParam as PlanCode)
      ? (planParam as PlanCode)
      : null;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(
    planFromUrl ?? "BASE"
  );

  const signUpSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    password: z
      .string()
      .min(
        6,
        isFr
          ? "Le mot de passe doit contenir au moins 6 caractères"
          : "Password must be at least 6 characters"
      ),
    fullName: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t("acceptTermsError"),
    }),
  });

  useEffect(() => {
    if (planFromUrl) setSelectedPlan(planFromUrl);
  }, [planFromUrl]);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      acceptTerms: false,
    },
  });

  const watchedEmail = form.watch("email");
  const emailTrimmed = watchedEmail?.trim() ?? "";
  const isEmailValid =
    emailTrimmed.length > 0 &&
    z.string().email().safeParse(emailTrimmed).success;
  const watchedPassword = form.watch("password") ?? "";
  const watchedAcceptTerms = form.watch("acceptTerms");

  async function onSubmit(values: SignUpValues) {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const billingPeriod =
        billingParam?.toLowerCase() === "annual" ? "annual" : "monthly";

      const finalRedirect = redirectTo || appPath("/dashboard");
      const callbackUrl = `${window.location.origin}/${locale}/callback?next=${encodeURIComponent(finalRedirect)}&type=signup`;

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password || "",
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: values.fullName,
            signup_plan: selectedPlan,
            ...(billingParam && { signup_billing: billingParam }),
          },
        },
      });

      if (error) throw error;

      pushSignUp({
        method: "password",
        plan_code: selectedPlan,
        billing_period: billingPeriod,
      });

      if (data.session) {
        toast.success(
          isFr ? "Compte créé avec succès !" : "Account created successfully!"
        );
        window.location.href = finalRedirect;
      } else {
        toast.success(
          isFr
            ? "Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte."
            : "Sign up successful! Please check your email to confirm your account."
        );
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : t("toastError");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

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
          {isFr ? "Créer un compte" : "Get started"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground pt-1">
          {isFr
            ? "Remplissez vos informations pour créer votre compte."
            : "Fill in your details to create your account."}
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
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t("fullNameLabel")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("fullNamePlaceholder")}
                      className="pl-10 h-11"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel className="text-sm font-medium">
                  {isFr ? "Mot de passe" : "Password"}
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
                {/* Password strength hint */}
                {watchedPassword.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3, 4].map((i) => {
                      const score = Math.min(
                        4,
                        Math.floor(watchedPassword.length / 3)
                      );
                      return (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              i <= score
                                ? score <= 1
                                  ? "#ef4444"
                                  : score === 2
                                  ? "#f59e0b"
                                  : score === 3
                                  ? "#84cc16"
                                  : "#22c55e"
                                : "rgba(120,120,120,0.2)",
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Accept terms */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-lg border border-border/40 p-3 bg-muted/20">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm cursor-pointer">
                    {t("acceptTermsPrefix")}{" "}
                    <Link
                      href="/legal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-4"
                      style={{ color: "#d4a850" }}
                    >
                      {t("termsLink")}
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            id="sign-up-submit"
            type="submit"
            size="lg"
            className="w-full h-11 font-semibold text-sm group"
            style={{
              background:
                "linear-gradient(135deg, #c49a30 0%, #e8b84b 50%, #c49a30 100%)",
              color: "#1a1000",
            }}
            disabled={
              loading ||
              !isEmailValid ||
              watchedPassword.length < 6 ||
              !watchedAcceptTerms
            }
          >
            <span>
              {loading ? t("submitting") : isFr ? "S'inscrire" : "Create account"}
            </span>
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
            {isFr ? "Déjà un compte ?" : "Already have an account?"}
          </span>
        </div>
      </div>

      {/* Sign-in link */}
      <Link
        href="/sign-in"
        className="flex items-center justify-center gap-1.5 w-full h-11 rounded-lg border border-border/60 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
      >
        {t("hasAccount")}
      </Link>
    </div>
  );
}
