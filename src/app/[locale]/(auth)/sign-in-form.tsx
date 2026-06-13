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
import { pushLogin } from "@/lib/gtm";

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
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const signInSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(1, isFr ? "Le mot de passe est requis" : "Password is required"),
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

      if (error) {
        throw error;
      }

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

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!emailTrimmed || !isEmailValid) {
      toast.error(isFr ? "Veuillez entrer une adresse email valide" : "Please enter a valid email address");
      return;
    }
    setResetLoading(true);
    try {
      const { sendResetPasswordEmail } = await import("@/app/actions/auth-actions");
      const result = await sendResetPasswordEmail(emailTrimmed, locale);
      if (result.success) {
        toast.success(
          isFr 
            ? "Si l'adresse email existe, un lien de réinitialisation a été envoyé." 
            : "If the email address exists, a reset link has been sent."
        );
        setIsForgotPasswordMode(false);
      } else {
        toast.error(result.error || (isFr ? "Une erreur est survenue" : "An error occurred"));
      }
    } catch (err: any) {
      toast.error(err.message || (isFr ? "Une erreur est survenue" : "An error occurred"));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl leading-none font-semibold tracking-tight">
          {isForgotPasswordMode 
            ? (isFr ? "Mot de passe oublié" : "Forgot Password")
            : t("title")}
        </h1>
        <CardDescription>
          {isForgotPasswordMode
            ? (isFr ? "Entrez votre e-mail pour recevoir un lien de réinitialisation." : "Enter your email to receive a password reset link.")
            : redirectTo
            ? t("descriptionSessionExpired")
            : isFr
            ? "Entrez votre e-mail et votre mot de passe pour vous connecter."
            : "Enter your email and password to sign in."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {isForgotPasswordMode ? (
            <form onSubmit={(e) => void handleResetPassword(e)} className="space-y-4">
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
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gold text-white hover:bg-gold/80"
                  disabled={resetLoading || !isEmailValid}
                >
                  {resetLoading ? (isFr ? "Envoi en cours..." : "Sending...") : (isFr ? "Envoyer le lien" : "Send link")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setIsForgotPasswordMode(false)}
                >
                  {isFr ? "Retour" : "Back"}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4"
            >
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
                    <div className="flex justify-between items-center">
                      <FormLabel>{isFr ? "Mot de passe" : "Password"}</FormLabel>
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordMode(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                      >
                        {isFr ? "Mot de passe oublié ?" : "Forgot password?"}
                      </button>
                    </div>
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
                className="w-full sm:w-auto"
                disabled={loading || !isEmailValid || watchedPassword.length === 0}
              >
                {loading ? t("submitting") : isFr ? "Se connecter" : "Sign In"}
              </Button>
            </form>
          )}
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href="/sign-up"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          {t("noAccount")}
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
