import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { SizerLogo } from "@/components/veta-logo";
import { GtmPageView } from "@/components/gtm";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen flex">
      <GtmPageView />
      <a href="#main-content" className="skip-link">
        {t("skipToContent")}
      </a>

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f0f0f 0%, #1a1408 40%, #2c1e00 70%, #1a1408 100%)",
        }}
      >
        {/* Ambient glow blobs */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-5%",
              width: "55%",
              height: "55%",
              background:
                "radial-gradient(ellipse, rgba(212,168,80,0.18) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              right: "0%",
              width: "60%",
              height: "50%",
              background:
                "radial-gradient(ellipse, rgba(212,168,80,0.12) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "30%",
              width: "40%",
              height: "40%",
              background:
                "radial-gradient(ellipse, rgba(180,130,40,0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        {/* Grid texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(212,168,80,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,80,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* Logo top-left */}
<div className="relative z-10 -ml-2">
  <Link href="/" className="inline-flex items-center">
    <SizerLogo height={200} className="filter brightness-0 invert" />          
  </Link>
</div>

        {/* Center hero text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(212,168,80,0.85)",
              marginBottom: "20px",
            }}
          >
            Studio Management
          </div>
          <h2
            style={{
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#ffffff",
              marginBottom: "20px",
            }}
          >
            Design projects,{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #d4a850 0%, #f0c96a 50%, #d4a850 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              brilliantly
            </span>{" "}
            managed.
          </h2>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.5)",
              maxWidth: "400px",
            }}
          >
            Everything your architecture or interior design studio needs — budgets,
            suppliers, clients, purchase orders, documents and more.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "36px",
            }}
          >
            {[
              "📐 Projects",
              "💼 Clients",
              "📦 Suppliers",
              "📄 Documents",
              "💰 Budgets",
              "🔄 Purchase Orders",
            ].map((label) => (
              <span
                key={label}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "rgba(212,168,80,0.9)",
                  border: "1px solid rgba(212,168,80,0.2)",
                  background: "rgba(212,168,80,0.06)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div
          className="relative z-10"
          style={{
            borderTop: "1px solid rgba(212,168,80,0.12)",
            paddingTop: "24px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              fontStyle: "italic",
            }}
          >
            "Build a home, not just a house."
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Top bar with back arrow and mobile logo */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            aria-label={t("backToHome")}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">Back</span>
          </Link>
          {/* Mobile-only logo */}
          <div className="lg:hidden">
            <Link href="/">
            <SizerLogo height={64} className="filter hue-rotate-[45deg]" />
            </Link>
          </div>
        </div>

        {/* Form centred in the remaining space */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-14">
          <div className="w-full max-w-[420px]">
            <main id="main-content">{children}</main>
          </div>
        </div>

        {/* Bottom legal strip */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Veta Studio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
