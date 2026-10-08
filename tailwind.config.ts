import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF7FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#087FE5",
          600: "#0267C1",
          700: "#034FA0",
          800: "#07417E",
          900: "#0C3768",
          950: "#082142",
        },
        surface: {
          light: "#F5F8FC",
          card: "#FFFFFF",
          border: "#D9E2EC",
          dark: "#0F172A",
          darkCard: "#1E293B",
        },
        accent: {
          amber: "#F59E0B",
          emerald: "#10B981",
          rose: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 25px -5px rgba(8, 127, 229, 0.12), 0 8px 10px -6px rgba(8, 127, 229, 0.08)',
        'elevated': '0 20px 30px -10px rgba(15, 23, 42, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
