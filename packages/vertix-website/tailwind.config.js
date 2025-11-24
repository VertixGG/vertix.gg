/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Vertix Website Colors (matching SCSS variables)
        vertix: {
          "pale-silver-lighter": "#c7bdbd",
          "sandy-beach": "#fce9d2",
          "bisque": "#ffe4c4",
          "skyblue": "#96d1fe",
          "very-light-azure": "#78bbff",
          "fresh-air": "#a9d7ff",
          "true-blue": "#097bc8",
          "dark-jungle-green": "#0f1e2e",
          "dark-jungle-green-darker": "#241F1D",
          "rich-black": "#05082b",
          "onyx": "#34383a",
          "eerie-black": "#191b1f",
          "eerie-black-lighter": "#1e1e1e",
        },
        // Discord Theme Specifics
        discord: {
           background: "#36393f",
           "chat-bg": "#36393f",
           "embed-bg": "#2f3136",
           "embed-border": "#202225",
           "text-normal": "#dcddde",
           "text-muted": "#72767d",
           "brand": "#5865f2",
           "hover": "rgba(4, 4, 5, 0.07)"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

