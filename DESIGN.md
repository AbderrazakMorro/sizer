---
version: alpha
name: Veta
description: Plataforma de gestión de proyectos de diseño interior para estudios y profesionales freelance - Personalizada con estética Sizer.ma
colors:
  # --- Dark mode (primary - inspired by Sizer.ma) ---
  background: "#000000"
  foreground: "#FFFFFF"
  muted: "#1A1A1A"
  muted-foreground: "#FFFFFF"
  card: "#1A1A1A"
  card-foreground: "#FFFFFF"
  border: "#333333"
  input: "#1A1A1A"
  ring: "#C8B89A"
  destructive: "#ca5551"
  destructive-foreground: "#f8f8f8"
  brand-golden: "#D4A853"
  brand-golden-foreground: "#000000"
  brand-cream: "#C8B89A"
  brand-cream-foreground: "#000000"
  sidebar: "#111111"
  sidebar-accent: "#1A1A1A"
  sidebar-border: "#333333"
  # --- Light mode variants (for specific sections) ---
  background-light: "#F5F5F5"
  foreground-light: "#000000"
  card-light: "#FFFFFF"
  muted-light: "#FFFFFF"
  muted-foreground-light: "#000000"
  accent-light: "#C8B89A"
  accent-foreground-light: "#000000"
  border-light: "#CCCCCC"
  input-light: "#FFFFFF"
  ring-light: "#C8B89A"
  destructive-light: "#ca5551"
  destructive-foreground-light: "#FFFFFF"
  brand-golden-light: "#D4A853"
  brand-golden-foreground-light: "#000000"
  brand-cream-light: "#C8B89A"
  brand-cream-foreground-light: "#000000"
  sidebar-light: "#FFFFFF"
  sidebar-accent-light: "#F5F5F5"
  sidebar-border-light: "#CCCCCC"
typography:
  # Display/Headings - Syne (from Sizer.ma)
  display:
    fontFamily: Syne
    fontSize: 3.75rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.03em
  h1:
    fontFamily: Syne
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: Syne
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  h3:
    fontFamily: Syne
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  # Body text - Manrope (from Sizer.ma)
  body-lg:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: 500
    lineHeight: 1.7
  body-md:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Manrope
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  # Labels/Form elements - Inter (from Sizer.ma)
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.05em
  # Logo - Montserrat (retained for brand continuity) with Sizer.ma influence
  logo:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1
  # UI/Navigation - Inter (from Sizer.ma)
  nav-label:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1
  button-text:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.05em
  # Decorative/Accent - Homemade Apple (from Sizer.ma)
  decorative:
    fontFamily: 'Homemade Apple'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1
  # Utility/Bold elements - Nunito Sans (from Sizer.ma)
  utility-bold:
    fontFamily: 'Nunito Sans'
    fontSize: 1rem
    fontWeight: 900
    lineHeight: 1
rounded:
  # Inspired by Sizer.ma's architectural precision - sharper corners
  sm: 0px
  md: 0px
  lg: 4px
  xl: 8px
  full: 9999px
spacing:
  # Enhanced spacing scale from Sizer.ma
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  2xl: 80px
  3xl: 120px
  gutter: 24px
  margin: 32px
components:
  # Buttons - Inspired by Sizer.ma's architectural buttons
  button-primary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderWidth: 1px
    borderColor: "{colors.ring}"
    rounded: "{rounded.md}"
    padding: "14px 32px"
    fontWeight: "600"
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  button-primary-hover:
    backgroundColor: "{colors.ring}"
    borderColor: "{colors.ring}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    borderWidth: 1px
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "14px 32px"
    fontWeight: "600"
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  button-secondary-hover:
    backgroundColor: "{colors.border}"
    textColor: "{colors.background}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "12px"
    fontWeight: "500"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    borderWidth: 0
    rounded: "{rounded.md}"
    padding: "12px"
  button-destructive-hover:
    backgroundColor: "#a44440"
  # Cards - Inspired by Sizer.ma's project thumbnails
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    borderWidth: 1px
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-hover:
    backgroundColor: "{colors.muted}"
    transform: "scale(1.02)"
  # Inputs and forms
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    borderWidth: 1px
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "12px"
  input-focus:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    borderWidth: 2px
    borderColor: "{colors.ring}"
    rounded: "{rounded.md}"
    padding: "12px"
  input-error:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    borderWidth: 1px
    borderColor: "{colors.destructive}"
    rounded: "{rounded.md}"
    padding: "12px"
  # Sidebar - Dark, architectural feel
  sidebar-item:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.muted}"
    borderWidth: 0
    rounded: "{rounded.sm}"
    padding: "8px"
  sidebar-item-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    borderWidth: 0
    rounded: "{rounded.sm}"
    padding: "8px"
  sidebar-item-hover:
    backgroundColor: "{colors.muted}"
  # Badges - Clean, architectural style
  badge-default:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    borderWidth: 1px
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-primary:
    backgroundColor: "{colors.ring}"
    textColor: "{Colors.background}"
    borderWidth: 0
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-golden:
    backgroundColor: "{colors.brand-golden}"
    textColor: "{colors.brand-golden-foreground}"
    borderWidth: 0
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    borderWidth: 0
    rounded: "{rounded.full}"
    padding: "4px 8px"
  # Dividers/Separators - Inspired by Sizer.ma
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  divider-light:
    backgroundColor: "{colors.border-light}"
    height: "1px"
---
## Overview

Veta está construida para diseñadores de interiores y estudios de arquitectura: profesionales que viven rodeados de texturas, materiales y paletas cuidadosamente elegidas. La interfaz refleja ese mundo — ahora con una estética premium inspirada en Sizer.ma, combinando lujo minimalista con funcionalidad profesional para diseñadores de interiores.

El lenguaje visual equilibra **precisión arquitectónica** y **calidez profesional**. Es una herramienta que los diseñadores pueden abrir cada mañana y que se siente coherente con el tipo de trabajo que hacen, pero elevada a un nivel de sofisticación premium.

El modo oscuro es primario: fondos negros profundos mantienen la identidad de marca en cualquier condición de luz. El modo claro se usa selectivamente para secciones específicas que requieren mayor luminosidad.

## Colors

La paleta está construida alrededor de una estética oscura y sofisticada inspirada en Sizer.ma, con acentos cálidos que conectan con el mundo del diseño de interiores.

- **Primary Background — Noir (`#000000`):** El negro puro es el fondo dominante, creando un lienzo sofisticado que hace que los colores y las imágenes destaquen. Conecta con la profundidad y seriedad del trabajo arquitectónico.

- **Primary Text — Blanc (`#FFFFFF`):** Texto blanco puro para máxima legibilidad sobre fondos oscuros, creando contraste nítido y sofisticado.

- **Surface — Charcoal (`#1A1A1A`):** Superficie ligeramente más clara que el fondo para tarjetas, panels y elementos elevados. Crea profundidad mediante capas tonales sutiles.

- **Border — Medium Gray (`#333333`):** Bordes discretos que definen elementos sin ser invasivos, manteniendo la precisión arquitectónica.

- **Input Background — Charcoal (`#1A1A1A`):** Fondos de entrada que se integran con la superficie mientras mantienen visibilidad.

- **Accent — Warm Beige (`#C8B89A`):** El único color de interacción principal en toda la interfaz. Se reserva para anillos de foco, estados seleccionados y highlight de interacción. Su calidez terrosa conecta con los materiales naturales que los diseñadores de interiores trabajan a diario.

- **Brand Golden — Gold Accent (`#D4A853`):** Usado para elementos decorativos premium, logotipos en contextos específicos y highlights de marca de lujo.

- **Brand Cream — Warm Beige (`#C8B89A`):** Similar al accent pero usado en contextos más amplios como fondos de secciones hero en modo claro.

- **Destructive — Rojo Tierra (`#ca5551`):** Mantiene su temperatura cálida para errores y acciones críticas, integrándose naturalmente con la paleta.

En modo claro (usado selectivamente):
- **Background — Off-White (`#F5F5F5`):** Fondo claro suave para secciones que requieren mayor luminosidad.
- **Surface — Blanc (`#FFFFFF`):** Tarjetas y elementos en modo claro.
- **Border — Light Gray (`#CCCCCC`):** Bordes discretos en modo claro.
- **Text — Noir (`#000000`):** Texto oscuro para máxima legibilidad.

Todos los pares texto/fondo cumplen WCAG AA (4.5:1) en ambos modos.

## Typography

Veta ahora usa una jerarquía tipográfica cuidadosamente seleccionada inspirada en Sizer.ma, cada fuente elegida por su propósito específico:

- **Display / Headings — Syne (600):** Tipografía geométrica moderna usada para titulares de marketing, títulos de secciones y encabezados importantes. Su presencia fuerte y arquitectónica comunica profesionalismo y confianza.

- **Body Text — Manrope (400-500):** Tipografía altamente legible usada para contenido descriptivo, explanations y cuerpo principal. Su apertura y claridad facilitan la lectura extensiva.

- **UI / Labels / Navigation — Inter (full range):** Fuente de interfaz versátil usada para botones, formularios, navegación y elementos de control. Su precisión técnica y legibilidad en pequeños tamaños la hacen perfecta para interfaces de usuario.

- **Decorative / Signature — Homemade Apple (400):** Tipografía manuscrita usada muy específicamente para elementos decorativos, firmas y toques personales que añaden calidez humana.

- **Utility / Bold Elements — Nunito Sans (900):** Usado para elementos que requieren peso visual extremo como números destacados, estadísticas o acentos tipográficos especiales.

Esta combinación crea una experiencia tipográfica que equilibra autoridad técnica con calidez humana, perfecta para profesionales del diseño que necesitan tanto precisión como creatividad.

## Layout & Depth

Sistema de layout inspirado en los principios de Sizer.ma:

- **Unidad Base Espaciada:** Sistema de grid con unidad base de 8px, pero con escalado mejorado (8, 16, 24, 40, 64, 80, 120px) para generar espacios más generosos y breaths entre elementos.

- **App Layout (`/veta-app`):** Layout de sidebar fija + área de contenido. El sidebar tiene su propio tono de color ligeramente más oscuro que el fondo, creando separación sutil sin bordes duros. El contenido se organiza en cards con precisión arquitectónica.

- **Marketing Layout (`/(marketing)`):** Columnas centradas con máximo ancho adaptativo. Secciones con separación generosa (80-160px+). Diseño que prioriza el impacto visual y la narrativa.

- **Responsive:** Breakpoints adaptativos que preservan la integridad del diseño en todos los tamaños de pantalla.

## Elevation & Depth

La profundidad se construya mediante capas tonales precisas y sombras arquitecturales sutiles:

- **En modo oscuro**, la jerarquía de superficiales es:
  `background (#000000)` → `card/muted (#1A1A1A)` → `secondary (usado selectivamente)` → `elementos elevados con sombra`

- **En modo claro** (cuando se usa):
  `background (#F5F5F5)` → `card (#FFFFFF)` → `muted (#FFFFFF)` → `elementos elevados`

- **Sombras sofisticadas:** En lugar de sombras pesadas, se usan sombras suaves y difundidas que sugieren elevación sin romper la estética minimalista. En modo oscuro, las sombras utilizan luz sutil desde arriba (similar a iluminación arquitectural directa).

- **Transiciones:** Animaciones suaves y refinadas (300-600ms) para hover, foco y cambios de estado, siguiendo el principio de movimiento definido de Sizer.ma.

## Shapes

Precisión arquitectónica en las formas:

- **Radio base arquitectónico: 0px-4px** (dependiendo del elemento):
  - `rounded.sm` (0px): elementos muy pequeños, chips internos, iconos con fondo afilado
  - `rounded.md` (0px): botones, inputs, selects con bordes rectos precisos
  - `rounded.lg` (4px): cards de proyectos, clientes y presupuestos; dialogs; modales con suavizado mínimo
  - `rounded.xl` (8px): elementos destacados, contenedores de sección hero
  - `rounded.full` (9999px): badges, avatares (cuando se requiere forma totalmente circular)

La predominancia de bordes rectos (0px) comunica precisión técnica y disciplina arquitectónica, mientras los radios mínimos (4px) añaden suficiente suavidad para mantener la accesibilidad y calidez.

## Components

### Botones — Precisión Arquitectural

- `button-primary`: Fondo negro con borde en Warm Beige (`#C8B89A`), texto blanco, transformación a mayúsculas, espaciado de letra. Hover invierte colores (fondo Warm Beige, texto negro).
- `button-secondary`: Fondo transparente, borde blanco, texto blanco, transformación a mayúsculas. Hover: fondo blanco, texto negro.
- `button-ghost`: Sin fondo, texto blanco o negro según contexto, para acciones secundarias.
- `button-destructive`: Rojo tierra con texto blanco, solo para acciones irreversibles.

### Tarjetas — Presentación de Proyectos

- Fondo `card` (`#1A1A1A`), borde medio gris (`#333333`), radio `lg` (4px), padding generoso.
- Variantes: card de proyecto (con imagen de portada a peł-bleed), card de cliente, card de resumen de presupuesto.
- Hover: sutil escala (1.02-1.03) y cambio de tono de fondo.

### Formularios y Entradas

- Fondo `input` (`#1A1A1A`), borde medio gris (`#333333`), radio `md` (0px).
- Estados: default → focus (anillo Warm Beige 2px) → error (borde rojo tierra).
- Etiquetas en fonte Inter peso medio.

### Badges — Estado y Categorización

- Tres variantes principales — default (superficie gris medio), primary (anillo Warm Beige), golden (dorado luxury).
- Texto en fonte apropiada según contexto (Inter para UI, Manrope para contenido).

### Sidebar — Navegación Arquitectural

- Fondo ligeramente más oscuro que el background principal, ítems con hover en superficie ligeramente más clara, ítem activo con fondo de tarjeta.
- Texto en fonte Inter, sin decoraciones excesivas.

## Imágenes y Media

Tratamiento de imágenes inspirado en fotografía arquitectural profesional:

```css
.project-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.6s ease-out;
}

.project-image:hover {
  transform: scale(1.03);  /* Sutil zoom arquitectural */
}
```

- **Estilo fotográfico:** Espacios interiores con luz natural caliente, detalles arquitectónicos, texturas de materiales.
- **Post-procesado:** Ligeramente desaturado, tons cálidos preservados, calidad profesional.
- **Formato:** Alta resolución, completo o contenido en grids precisos.

## Animaciones e Interacciones

Principios de movimiento refinados:

- **Entrada en pantalla:** Fade-in + deslizamiento sutil hacia arriba (300-600ms ease-out)
- **Estados de hover:** Transiciones suaves de color, escalado mínimo (1-3%), sombras arquitecturales sutiles
- **Transiciones de estado:** Cambios suaves entre valores, nunca bruscos
- **Feedback interactivo:** Respuesta táctil visual inmediata pero sofisticada

### Animaciones Comunes

```css
/* Fade-in en scroll */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Hover refinado */
.hover-refined {
  transition: all 0.3s ease;
}

.hover-refined:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Zoom sutil para imágenes */
.image-zoom {
  transition: transform 0.6s ease-out;
}

.image-zoom:hover {
  transform: scale(1.03);
}
```

## Do's and Don'ts

### Do

- Usar el fondo negro (`#000000`) como base predominante en modo oscuro
- Mantener contraste WCAG AA (4.5:1) para todo texto sobre superficies
- Usar la escala tonal para expresar elevación (negro → gris carbón → superficie clara)
- Aplicar bordes rectos (0px) para elementos de UI precisos, radios mínimos (4px) para tarjetas
- Usar tipografía específica por propósito: Syne para titulares, Manrope para cuerpo, Inter para UI
- Aplicar el color Warm Beige (`#C8B89A`) como único color de interacción principal
- Usar generosos espacios en blanco (respiraje) entre secciones y elementos
- Implementar animaciones suaves y refinadas (300-600ms) siguiendo principios de movimiento definidos

### Don't

- No mezclar esquinas rectas (0px) con radios grandes en la misma vista sin transición cuidadosa
- No usar más de tres pesos tipográficos diferentes en una misma pantalla
- No usar colores literales para superficies — siempre usar tokens semánticos
- No sobrecargar la interfaz con elementos decorativos — el minimalismo es clave
- No usar el Warm Beige (`#C8B89A`) en más de un componente prominente por pantalla (evitar dilución)
- No aplicar sombras pesadas que rompan la estética minimalista y arquitectónica
- No usar tracking espaciado excesivo en cuerpos de texto — reservar para titulares y UI específicos

## Integración con la Identidad de Veta

Esta personalización mantiene la esencia de Veta como plataforma para diseñadores de interiores mientras eleva su estética a un nivel premium inspirado en Sizer.ma:

1. **Propósito Conservado:** Gestión de proyectos, clientes, presupuestos y catálogos para diseñadores de interiores
2. **Estética Elevada:** De cálida y operativa a sofisticada y arquitectónicamente precisa
3. **Funcionalidad Mejorada:** Los principios de diseño de Sizer.ma (claridad, jerarquía, precisión) mejoran la usabilidad
4. **Conexión Profesional:** Ambas plataformas hablan el mismo lenguaje de diseño de interiores y arquitectura
5. **Experiencia de Usuario:** La combinación crea una herramienta que se siente tanto profesional como inspiradora

Veta ahora no solo gestiona proyectos de diseño interior — lo hace a través de una interfaz que refleja los mismos estándares de excelencia, precisión y sensibilidad estética que los profesionales aplican en su trabajo diario.