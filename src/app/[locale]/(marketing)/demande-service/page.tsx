import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceRequestForm } from "@/components/forms/service-request-form";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "demande-service" });

  return {
    title: t("title", { fallback: "Demande de service | Veta Studio" }),
    description: t("description", { fallback: "Initiez votre projet d'architecture et de design avec Veta Studio." }),
  };
}

export default async function DemandeServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
              Démarrer un projet
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chaque grand projet commence par une conversation. Remplissez le formulaire ci-dessous
              et notre équipe vous contactera pour organiser une première rencontre.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <ServiceRequestForm />
          </div>
        </div>
      </main>
    </div>
  );
}
