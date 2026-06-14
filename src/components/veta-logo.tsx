import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/img/LOGONEW25.png";

/** Dimensiones intrínsecas del logo (257×189, más ancho que alto). */
const LOGO_WIDTH = 257;
const LOGO_HEIGHT = 189;

export type SizerLogoVariant = "icon" | "full";

export type SizerLogoProps = {
  /** "icon" = solo imagen, "full" = imagen + texto. Por defecto "full". */
  variant?: SizerLogoVariant;
  /** Si se indica, tiene prioridad sobre variant para mostrar/ocultar el texto. */
  showWordmark?: boolean;
  className?: string;
  height?: number;
  width?: number;
};

/** Logo para modo claro (logo oscuro). Oculto en tema dark (Tailwind dark:). */
function LogoLight({
  width,
  height,
  className,
  alt,
}: {
  width: number;
  height: number;
  className?: string;
  alt: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={width}
      height={height}
      className={cn("h-auto w-auto flex-shrink-0", className)}
      priority
    />
  );
}

/** Logo para modo oscuro (logo claro). Oculto en tema light (Tailwind dark:). */
function LogoDark({
  width,
  height,
  className,
  alt,
}: {
  width: number;
  height: number;
  className?: string;
  alt: string;
}) {
  // Use the same official logo for now (no separate dark asset provided).
  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={width}
      height={height}
      className={cn("h-auto w-auto flex-shrink-0", className)}
      priority
    />
  );
}

/**
 * Logo de Sizer. Alterna entre solo imagen (variant="icon") o imagen + texto (variant="full").
 * Modo claro/oscuro detectado automáticamente vía Tailwind (clase dark en el DOM, p. ej. next-themes).
 */
export function SizerLogo({
  variant = "full",
  showWordmark,
  className,
  height = 35,
  width,
}: SizerLogoProps) {
  const showText = false;
  /** Empty alt when wordmark is visible to avoid redundant "Sizer Sizer" for screen readers */
  const logoSrOnly = "Sizer";

  const aspectRatio = LOGO_WIDTH / LOGO_HEIGHT;
  const containerWidth = width ?? Math.round((height ?? 28) * aspectRatio);
  const containerHeight =
    height ?? (width != null ? Math.round(width / aspectRatio) : 28);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0 text-[0px]",
        className
      )}
    >
      <span
        className="relative inline-flex flex-shrink-0 items-center justify-center"
        style={{ width: containerWidth, height: containerHeight }}
      >
        <LogoLight
          width={containerWidth}
          height={containerHeight}
          className="absolute inset-0 h-full w-full object-contain"
          alt={logoSrOnly}
        />
        <LogoDark
          width={containerWidth}
          height={containerHeight}
          className="absolute inset-0 h-full w-full object-contain"
          alt={logoSrOnly}
        />
      </span>
      {showText && (
        <span
          className="text-foreground text-left align-middle text-base font-light tracking-wide"
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "16px",
            fontWeight: "300",
            lineHeight: "20px",
          }}
        >
          Sizer
        </span>
      )}
    </div>
  );
}
