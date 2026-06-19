import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { GtmScriptGate } from "@/components/gtm/gtm-script-gate";
import { CONSENT_STORAGE_KEY, getDefaultGtmConsent } from "@/lib/consent";
import {
  JsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
} from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import "../styles/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Gestion de projets de design d'intérieur",
    template: "%s | Veta",
  },
  description:
    "Plateforme complète pour gérer des projets de design d'intérieur. Gérez clients, fournisseurs, catalogues et devis en un seul endroit.",
  keywords: [
    "design d'intérieur",
    "gestion de projet",
    "architecture intérieure",
    "logiciel design",
    "devis",
    "catalogue produits",
  ],
  authors: [{ name: "Veta" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Veta",
    title: "Veta - Gestion de projets de design d'intérieur",
    description:
      "Plateforme complète pour gérer des projets de design d'intérieur.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Veta - Gestion de projets de design d'intérieur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veta - Gestion de projets de design d'intérieur",
    description:
      "Plateforme complète pour gérer des projets de design d'intérieur.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/img/veta-favicon-light.png", type: "image/png" },
      {
        url: "/img/veta-favicon-dark.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/img/veta-favicon-light.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solo desarrollo: forzar global-error.tsx con cookie test-global-error=1
  if (process.env.NODE_ENV === "development") {
    const cookieStore = await cookies();
    if (cookieStore.get("test-global-error")?.value === "1") {
      throw new Error("Error de prueba para comprobar global-error.tsx");
    }
  }

  // Default consent when no stored preference (e.g. first visit or EU). Injected so inline script can use it.
  const defaultDeniedPayload = getDefaultGtmConsent(true);

  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Aplicar tema antes del primer pintado para evitar que la 404 (y el resto) pierda formato al hidratar (next-themes aplica la clase después). */}
        <Script
          id="early-theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='theme';var t=localStorage.getItem(k);var s=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=!t||t==='system'?s:t==='dark';document.documentElement.classList.remove('light');document.documentElement.classList.toggle('dark',isDark);}catch(e){}})();`,
          }}
        />

        {/* Material Symbols (used on marketing landing page services/icons) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />

        {/* Consent default must be read from localStorage in the browser so returning users who already accepted get analytics_storage: granted before GTM/GA runs. Server cannot read localStorage, so we inject default-denied and let this script override from storage. */}
        <Script
          id="gtm-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
(function(){
  var key = ${JSON.stringify(CONSENT_STORAGE_KEY)};
  var defaultDenied = ${JSON.stringify(defaultDeniedPayload)};
  try {
    var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      var p = JSON.parse(raw);
      gtag('consent', 'default', {
        ad_storage: p.marketing ? 'granted' : 'denied',
        ad_user_data: p.marketing ? 'granted' : 'denied',
        ad_personalization: p.marketing ? 'granted' : 'denied',
        analytics_storage: p.analytics ? 'granted' : 'denied',
        functionality_storage: 'granted',
        personalization_storage: p.personalization ? 'granted' : 'denied',
        security_storage: 'granted'
      });
    } else {
      gtag('consent', 'default', defaultDenied);
    }
  } catch (e) {
    gtag('consent', 'default', defaultDenied);
  }
})();
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', false);
          `.trim(),
          }}
        />
      </head>
      <body className="bg-background min-h-screen font-body antialiased">
        <GtmScriptGate />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={softwareApplicationJsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
