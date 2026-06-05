import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        hobi: {
          bg: "#F8FBFF",
          card: "rgba(255,255,255,0.86)",
          border: "#DDE7F5",
          ink: "#10234A",
          muted: "#6B7A99",
          blue: "#2F67FF",
          pink: "#F044B8",
          cyan: "#25C3D8",
          purple: "#8B5CF6",
          amber: "#F4B63F"
        }
      },
      boxShadow: {
        glass: "0 18px 48px rgba(47, 103, 255, 0.10)",
        control: "0 10px 28px rgba(47, 103, 255, 0.12)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
