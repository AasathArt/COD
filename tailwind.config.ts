import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1F75FE",
          "blue-dark": "#1656C4",
          yellow: "#FFC324",
          "yellow-dark": "#E6AC0F",
        },
        status: {
          new: "#6B7280",
          confirmed: "#1F75FE",
          packing: "#8B5CF6",
          shipped: "#F59E0B",
          ofd: "#FB923C",
          delivered: "#16A34A",
          cancelled: "#EF4444",
          returned: "#DC2626",
        },
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
