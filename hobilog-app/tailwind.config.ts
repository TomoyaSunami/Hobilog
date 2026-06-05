import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        hobi: {
          bg: "#F2F2F7",
          card: "rgba(255,255,255,0.92)",
          border: "rgba(60,60,67,0.14)",
          ink: "#1C1C1E",
          muted: "#6E6E73",
          blue: "#007AFF",
          pink: "#FF2D55",
          cyan: "#32ADE6",
          purple: "#AF52DE",
          amber: "#FF9500"
        }
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0, 0, 0, 0.06)",
        control: "0 8px 18px rgba(0, 122, 255, 0.18)"
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
