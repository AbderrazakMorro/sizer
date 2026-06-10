/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Colors - Based on Sizer.ma inspired design system
      colors: {
        // Dark mode (primary)
        black: '#000000',
        white: '#FFFFFF',
        charcoal: '#1A1A1A',
        dark: '#111111',

        // Neutrals
        'gray-900': '#0A0A0A',
        'gray-800': '#141414',
        'gray-700': '#1A1A1A',
        'gray-600': '#2A2A2A',
        'gray-500': '#333333',
        'gray-400': '#666666',
        'gray-300': '#999999',
        'gray-200': '#CCCCCC',
        'gray-100': '#F5F5F5',
        'gray-50': '#FAFAFA',

        // Accents
        beige: '#C8B89A',
        gold: '#D4A853',
        terracotta: '#C17A50',

        // Semantic colors (keeping original names for compatibility but updating values)
        background: '#000000',
        foreground: '#FFFFFF',
        muted: '#1A1A1A',
        'muted-foreground': '#FFFFFF',
        card: '#1A1A1A',
        'card-foreground': '#FFFFFF',
        border: '#333333',
        input: '#1A1A1A',
        ring: '#C8B89A',
        destructive: '#ca5551',
        'destructive-foreground': '#f8f8f8',
        'brand-golden': '#D4A853',
        'brand-golden-foreground': '#000000',
        'brand-cream': '#C8B89A',
        'brand-cream-foreground': '#000000',
        sidebar: '#111111',
        'sidebar-accent': '#1A1A1A',
        'sidebar-border': '#333333',

        // Light mode variants (for specific sections)
        'background-light': '#F5F5F5',
        'foreground-light': '#000000',
        'card-light': '#FFFFFF',
        'muted-light': '#FFFFFF',
        'muted-foreground-light': '#000000',
        'accent-light': '#C8B89A',
        'accent-foreground-light': '#000000',
        'border-light': '#CCCCCC',
        'input-light': '#FFFFFF',
        'ring-light': '#C8B89A',
        'destructive-light': '#ca5551',
        'destructive-foreground-light': '#FFFFFF',
        'brand-golden-light': '#D4A853',
        'brand-golden-foreground-light': '#000000',
        'brand-cream-light': '#C8B89A',
        'brand-cream-foreground-light': '#000000',
        'sidebar-light': '#FFFFFF',
        'sidebar-accent-light': '#F5F5F5',
        'sidebar-border-light': '#CCCCCC',
      },

      // Font Family - Based on Sizer.ma typography system
      fontFamily: {
        // Display/Headings - Syne
        display: ['Syne', 'sans-serif'],
        // Secondary/Body - Manrope
        body: ['Manrope', 'sans-serif'],
        // Tertiary/UI - Inter
        ui: ['Inter', 'sans-serif'],
        // Accent/Signature - Homemade Apple
        accent: ['Homemade Apple', 'cursive'],
        // Utility/Bold - Nunito Sans
        bold: ['Nunito Sans', 'sans-serif'],
        // Keep Montserrat for logo/brand continuity
        montserrat: ['Montserrat', 'sans-serif'],
      },

      // Font Weights
      fontWeight: {
        hairline: '100',
        thin: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // Border Radius - Architectural precision (mostly 0px with minimal rounding)
      borderRadius: {
        xs: '0px',
        sm: '0px',
        md: '0px',
        lg: '4px',
        xl: '8px',
        '2xl': '12px',
        '3xl': '16px',
        '4xl': '20px',
        full: '9999px',
      },

      // Spacing Scale - Enhanced from Sizer.ma
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '40px',
        xl: '64px',
        '2xl': '80px',
        '3xl': '120px',
        '4xl': '160px',
        '5xl': '200px',
        '6xl': '240px',
      },

      // Typography
      fontSize: {
        'display-4xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-3xl': ['60px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-2xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-xl': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['30px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['20px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'xs': ['0.75rem', { lineHeight: '1.5' }],
      },

      // Line Height
      lineHeight: {
        tight: '1.1',
        snug: '1.2',
        normal: '1.3',
        relaxed: '1.6',
        loose: '1.7',
      },

      // Letter Spacing / Tracking
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.03em',
        normal: '0',
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.15em',
      },

      // Transition Duration and Easing
      transitionDuration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        250: '250ms',
        300: '300ms',
        350: '350ms',
        400: '400ms',
        500: '500ms',
        600: '600ms',
        700: '700ms',
        800: '800ms',
        900: '900ms',
        1000: '1000ms',
      },

      transitionTimingFunction: {
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'fast-decelerate': 'cubic-bezier(0.05, 0.8, 0.2, 1)',
      },

      // Box Shadow - Sophisticated and subtle
      boxShadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        // Subtle shadows for elevated elements
        'inner-sm': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Light/Lift shadows for hover states
        'lift-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'lift-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lift-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        // Dark mode shadows (using light from above like architectural lighting)
        'dark-sm': '0 -1px 3px 0 rgba(255, 255, 255, 0.1), 0 -1px 2px 0 rgba(255, 255, 255, 0.06)',
        'dark-md': '0 -4px 6px -1px rgba(255, 255, 255, 0.1), 0 -2px 4px -1px rgba(255, 255, 255, 0.06)',
        'dark-lg': '0 -10px 15px -3px rgba(255, 255, 255, 0.1), 0 -4px 6px -2px rgba(255, 255, 255, 0.05)',
      },

      // Opacity
      opacity: {
        5: '0.05',
        10: '0.1',
        15: '0.15',
        20: '0.2',
        25: '0.25',
        30: '0.3',
        35: '0.35',
        40: '0.4',
        45: '0.45',
        50: '0.5',
        55: '0.55',
        60: '0.6',
        65: '0.65',
        70: '0.7',
        75: '0.75',
        80: '0.8',
        85: '0.85',
        90: '0.9',
        95: '0.95',
      },

      // Z-index
      zIndex: {
        auto: 'auto',
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        200: '200',
        300: '300',
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
        900: '900',
        1000: '1000',
        1100: '1100',
        1200: '1200',
        1300: '1300',
        1400: '1400',
        1500: '1500',
        1600: '1600',
        1700: '1700',
        1800: '1800',
        1900: '1900',
        2000: '2000',
        2100: '2100',
        2200: '2200',
        2300: '2300',
        2400: '2400',
        2500: '2500',
      },
    },
  },
  plugins: [],
};