import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17151f",
        muted: "#6b6575",
        panel: "#fbfaff",
        line: "#e8e3ef",
        accent: "#7c5cff",
        lilac: "#f4f0ff",
        mint: "#e8f7ef",
        amber: "#fff3da"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(28, 20, 48, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
