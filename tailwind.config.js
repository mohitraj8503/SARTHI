/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Light theme only - premium ed-tech look
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
    screens: {
      'xs': '375px',   // Small phones
      'sm': '640px',   // Large phones
      'md': '768px',   // Tablets
      'lg': '1024px',  // Small laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large screens
    },
      fontFamily: {
        instrument: ['"Instrument Sans"', 'var(--font-instrument)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'var(--font-instrument)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['"Instrument Sans"', 'var(--font-manrope)', 'system-ui', 'sans-serif'],
        // Standardizing legacy fonts to Inter for professional look
        outfit: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        nunito: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'smooth': 'smooth 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shine': 'shine 0.75s ease-out forwards',
      },
      keyframes: {
        smooth: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shine: {
          '100%': { left: '100%' },
        },
      },
      colors: {
        // Premium Cinema-Level Palette
        premium: {
          primary: "#0F172A", // Deep Navy
          accent: "#10B981",  // Emerald
          text: "#1E293B",    // Primary Text
          muted: "#64748B",   // Secondary Text
          surface: "#F8FAFC", // Surface-Alt
          border: "#E2E8F0",  // Border
        },
        // Base colors
        bg: "#FCFCFA",
        surface: "#FFFFFF",

        // Custom Developer Shades for Premium Ed-tech Look
        'emerald-350': '#34d399',
        'emerald-450': '#10b981',
        'emerald-650': '#059669',
        'emerald-750': '#047857',
        'red-650': '#e11d48',
        'red-750': '#be123c',
        'slate-150': '#f1f5f9',
        'slate-350': '#cbd5e1',
        'slate-450': '#94a3b8',
        'slate-650': '#475569',
        'slate-850': '#1e293b',

        // Premium Warm Palette
        warm: {
          ivory: '#FAF8F5',
          white: '#FDFCFA',
          cream: '#F3EFE8',
          border: 'rgba(180,160,140,0.2)',
        },

        // Accent Pastels
        pastel: {
          blush: '#F2D4CC',
          blushSoft: '#FDF0EC',
          gold: '#FDF6E8',
          sage: '#EDF4EB',
          lavender: '#F0EDF8',
        },

        // Gold Accent
        gold: {
          DEFAULT: '#C9A96E',
          light: '#D4B87A',
          dark: '#A88B4E',
        },

        // Text Colors
        text: {
          strong: "#0F172A",
          base: "#1F2937",
          soft: "#4B5563",
          subtle: "#6B7280",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          ghost: "#E8F0FF",
        },
        line: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
        muted: "#F3F4F6",
        info: "#0EA5E9",
        success: "#059669",
        danger: "#DC2626",

        // Aliases for compatibility during migration
        border: "#E5E7EB",
        input: "#FFFFFF",
        ring: "#2563EB",
        background: "#FCFCFA",
        foreground: "#1F2937",
        "muted-foreground": "#6B7280",
        "primary-foreground": "#FFFFFF",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        secondary: {
          DEFAULT: "#F3F4F6",
          foreground: "#1F2937",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F3F4F6",
          foreground: "#1F2937",
        },
        brand: {
          dark: '#1C2B4A',
          orange: '#D4956A',
        },
        // Premium Palette
        forest: {
          DEFAULT: '#1B4332', // Primary Dark Green
          light: '#2D6A4F',   // Hover Green
          accent: '#40916C',  // Light Green Accents
        },
        cream: {
          DEFAULT: '#FDFBF7', // Main Background
          warm: '#F8F5F0',    // Secondary Background
        },
        grayscale: {
          1: 'var(--color-grayscale-1, #fcfcfc)',
          2: 'var(--color-grayscale-2, #f9f9f9)',
          3: 'var(--color-grayscale-3, #f0f0f0)',
          4: 'var(--color-grayscale-4, #e8e8e8)',
          5: 'var(--color-grayscale-5, #e0e0e0)',
          6: 'var(--color-grayscale-6, #dddddd)',
          7: 'var(--color-grayscale-7, #d0d0d0)',
          8: 'var(--color-grayscale-8, #bcbcbc)',
          9: 'var(--color-grayscale-9, #8b8b8b)',
          10: 'var(--color-grayscale-10, #7e7e7e)',
          11: 'var(--color-grayscale-11, #606060)',
          12: 'var(--color-grayscale-12, #111111)',
        },
      },
      boxShadow: {
        smx: "0 1px 2px rgba(15,23,42,0.06)",
        mdx: "0 6px 20px rgba(15,23,42,0.08)",
        // Premium soft shadows
        soft: "0 20px 60px rgba(27, 67, 50, 0.08)",
        softHover: "0 30px 80px rgba(27, 67, 50, 0.15)",
        glow: "0 4px 20px rgba(201,169,110,0.15)",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)',
      },
      // ... keep existing animations if needed
    },
  },
  plugins: [],
};
