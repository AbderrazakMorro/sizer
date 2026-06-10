import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "fr",
  // Strategy: FR is the default locale and is served without prefix ("/").
  // EN is prefixed with "/en".
  localePrefix: "as-needed",
  // Avoid serving variable content for the same URL based on cookies/headers.
  // We want "/"" to always be FR, and "/en" to always be EN.
  // Avoid variable routing behavior based on headers/cookies.
  localeDetection: false,
  // Slugs (pathnames) localized per locale. Route keys are the internal, stable
  // paths used by Link/redirect helpers in the app router.
  pathnames: {
    "/": { fr: "/", en: "/" },
    "/pricing": { fr: "/tarifs", en: "/pricing" },
    "/about": { fr: "/a-propos", en: "/about-veta" },
    "/contact": { fr: "/contact", en: "/contact" },
    "/demo": { fr: "/demo", en: "/demo" },
    "/blog": { fr: "/blog", en: "/blog" },
    "/blog/[slug]": { fr: "/blog/[slug]", en: "/blog/[slug]" },
    "/legal": { fr: "/mentions-legales", en: "/legal" },
    // Auth routes (no slug translation; keep stable path segments)
    "/sign-in": { fr: "/sign-in", en: "/sign-in" },
    "/sign-up": { fr: "/sign-up", en: "/sign-up" },
    "/auth/complete": { fr: "/auth/complete", en: "/auth/complete" },
    "/plan-base": {
      fr: "/plan-de-base-premier-projet",
      en: "/base-plan-first-interior-design-project",
    },
    "/plan-pro": {
      fr: "/plan-pro-independant",
      en: "/pro-plan-for-independent-interior-designers",
    },
    "/plan-studio": {
      fr: "/plan-studio-entreprise",
      en: "/studio-plan-for-architecture-and-interior-design-firms",
    },
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
