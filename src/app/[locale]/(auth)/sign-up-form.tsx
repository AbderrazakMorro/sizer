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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { pushSignUp } from "@/lib/gtm";

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
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(
    planFromUrl ?? "BASE"
  );

  const signUpSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(6, isFr ? "Le mot de passe doit contenir au moins 6 caractères" : "Password must be at least 6 characters"),
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

      if (error) {
        throw error;
      }

      pushSignUp({
        method: "password",
        plan_code: selectedPlan,
        billing_period: billingPeriod,
      });

      // Check if session was automatically created (meaning email confirmation is disabled)
      if (data.session) {
        toast.success(isFr ? "Compte créé avec succès !" : "Account created successfully!");
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
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl leading-none font-semibold tracking-tight">
          {t("title")}
        </h1>
        <CardDescription>
          {isFr
            ? "Entrez vos coordonnées et un mot de passe pour créer votre compte."
            : "Enter your details and a password to create your account."}
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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fullNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      {t("acceptTermsPrefix")}{" "}
                      <Link
                        href="/legal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        {t("termsLink")}
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading || !isEmailValid || watchedPassword.length < 6 || !watchedAcceptTerms}
            >
              {loading ? t("submitting") : isFr ? "S'inscrire" : "Sign Up"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href="/sign-in"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          {t("hasAccount")}
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          {t("backToHome")}
        </Link>
      </CardFooter>
    </Card>
  );
}
