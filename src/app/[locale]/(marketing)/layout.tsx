import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SizerLogo } from "@/components/veta-logo";
import { MarketingHeader } from "@/components/layouts/marketing-header";
import { RedirectAuthenticatedToDashboard } from "@/components/redirect-authenticated-to-dashboard";
import { AnchorToHash } from "@/components/smooth-scroll-link";
import { CookieConsentBanner } from "@/components/consent";
import { GtmPageView } from "@/components/gtm";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Veta - Gestión de proyectos de diseño interior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

async function Footer({ locale }: { locale: string }) {
  const isFr = locale === "fr";

  return (
    <footer className="bg-surface-container-lowest w-full mt-section-gap border-t border-outline-variant/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-section-gap max-w-screen-2xl mx-auto">
        <div className="md:col-span-1 mb-8 md:mb-0 flex flex-col gap-4">
          <SizerLogo height={32} className="justify-start" />
          <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">
            {isFr ? "Architecture • Intérieur • Artisans" : "Architecture • Interior • Artisans"}
          </p>
        </div>
        
        <div className="md:col-span-1 flex flex-col gap-4">
          <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-2 opacity-50">
            {isFr ? "LIENS RAPIDES" : "QUICK LINKS"}
          </p>
          <AnchorToHash
            href="/#projets"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {isFr ? "PROJETS" : "PROJECTS"}
          </AnchorToHash>
          <AnchorToHash
            href="/#apropos"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {isFr ? "À PROPOS" : "ABOUT"}
          </AnchorToHash>
          <AnchorToHash
            href="/#services"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {isFr ? "SERVICES" : "SERVICES"}
          </AnchorToHash>
          <AnchorToHash
            href="/#contact"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {isFr ? "CONTACT" : "CONTACT"}
          </AnchorToHash>
        </div>

        <div className="md:col-span-1 flex flex-col gap-4">
          <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-2 opacity-50">
            {isFr ? "SUIVEZ-NOUS" : "FOLLOW US"}
          </p>
          <a
            href="#"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            INSTAGRAM
          </a>
          <a
            href="#"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            LINKEDIN
          </a>
          <a
            href="#"
            className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 w-fit relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            BEHANCE
          </a>
        </div>

        <div className="md:col-span-1 flex flex-col justify-end items-start md:items-end mt-12 md:mt-0">
          <div className="flex gap-4 mb-4">
            <Link
              href="/legal"
              className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 text-[10px]"
            >
              {isFr ? "MENTIONS LÉGALES" : "LEGAL NOTICE"}
            </Link>
            <span className="text-on-surface-variant text-[10px]">|</span>
            <Link
              href="/legal"
              className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 text-[10px]"
            >
              {isFr ? "POLITIQUE DE CONFIDENTIALITÉ" : "PRIVACY POLICY"}
            </Link>
          </div>
          <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] opacity-60">
            {isFr ? "© 2024 SIZER. Tous droits réservés." : "© 2024 SIZER. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tCommon = await getTranslations("Common");

  return (
    <div className="flex min-h-screen flex-col">
      <CookieConsentBanner />
      <GtmPageView />
      <a href="#main-content" className="skip-link">
        {tCommon("skipToContent")}
      </a>
      <RedirectAuthenticatedToDashboard />
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
