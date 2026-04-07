/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // TYPOGRAPHY SCALE
      // ═══════════════════════════════════════════════════════════════════
      fontSize: {
        // Display scale — for heroes and section titles
        "display-2xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        // Body scale
        "body-xl": ["1.25rem", { lineHeight: "1.6" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5" }],
        // Metadata scale — for labels and captions
        "meta-lg": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        "meta-md": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.03em" }],
        "meta-sm": ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.04em" }],
      },

      // ═══════════════════════════════════════════════════════════════════
      // SPACING SCALE — Section rhythm
      // ═══════════════════════════════════════════════════════════════════
      spacing: {
        "section-sm": "4rem",
        "section-md": "6rem",
        "section-lg": "8rem",
        "section-xl": "10rem",
        "section-2xl": "12rem",
      },

      // ═══════════════════════════════════════════════════════════════════
      // COLORS — Brand palettes
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // NOIZYFISH — Deep ocean, museum-grade
        ocean: {
          50: "#f0fdff",
          100: "#ccf7fe",
          200: "#99edfc",
          300: "#54ddf9",
          400: "#22c5ed",
          500: "#06a6d4",
          600: "#0884b2",
          700: "#0e6a90",
          800: "#155676",
          900: "#164863",
          950: "#082f44",
        },
        abyss: {
          DEFAULT: "#080c14",
          50: "#f4f6f7",
          100: "#e3e7eb",
          200: "#c9d1d9",
          300: "#a3b1be",
          400: "#768a9c",
          500: "#5b6f81",
          600: "#4d5c6c",
          700: "#434e5a",
          800: "#3b444d",
          900: "#1a2030",
          950: "#080c14",
        },
        // Museum-grade accents
        silver: {
          oxide: "#7a8a9a",
          patina: "#9aacbc",
          bright: "#c4d4e4",
        },
        midnight: {
          DEFAULT: "#0a1628",
          blue: "#0f2847",
          deep: "#061020",
        },

        // NOIZYVOX — Intimate, futuristic, trust-heavy
        voice: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
        sovereign: {
          DEFAULT: "#0c0814",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#1c1028",
          950: "#0c0814",
        },
        // Plum and violet spectrum
        plum: {
          DEFAULT: "#2d1f3d",
          light: "#3d2a52",
          dark: "#1e1429",
          deep: "#140e1c",
        },
        magenta: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
          950: "#500724",
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // FONTS
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      // ═══════════════════════════════════════════════════════════════════
      // SHADOWS — Subtle, earned glow
      // ═══════════════════════════════════════════════════════════════════
      boxShadow: {
        // NOIZYFISH — Blue glow only when earned
        "ocean-sm": "0 0 10px rgba(6, 166, 212, 0.1)",
        "ocean-md": "0 0 20px rgba(6, 166, 212, 0.15)",
        "ocean-lg": "0 0 40px rgba(6, 166, 212, 0.2)",
        "ocean-glow": "0 0 60px rgba(6, 166, 212, 0.3)",
        // NOIZYVOX — Violet/magenta glow
        "voice-sm": "0 0 10px rgba(168, 85, 247, 0.1)",
        "voice-md": "0 0 20px rgba(168, 85, 247, 0.15)",
        "voice-lg": "0 0 40px rgba(168, 85, 247, 0.2)",
        "voice-glow": "0 0 60px rgba(168, 85, 247, 0.3)",
        // Card shadows
        "card-rest": "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 10px 30px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3)",
        "card-elevated": "0 20px 50px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)",
      },

      // ═══════════════════════════════════════════════════════════════════
      // BORDERS
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        "card": "0.75rem",
        "card-lg": "1rem",
        "panel": "1.25rem",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ANIMATIONS — Calm, intentional
      // ═══════════════════════════════════════════════════════════════════
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in-slow": "fadeIn 1.5s ease-out forwards",
        "pulse-ocean": "pulseOcean 4s ease-in-out infinite",
        "pulse-voice": "pulseVoice 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "wave": "wave 8s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "breathe": "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseOcean: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(6, 166, 212, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(6, 166, 212, 0.4)" },
        },
        pulseVoice: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(168, 85, 247, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wave: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.9" },
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // BACKDROP BLUR
      // ═══════════════════════════════════════════════════════════════════
      backdropBlur: {
        xs: "2px",
        panel: "20px",
        heavy: "40px",
      },

      // ═══════════════════════════════════════════════════════════════════
      // TRANSITIONS
      // ═══════════════════════════════════════════════════════════════════
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
