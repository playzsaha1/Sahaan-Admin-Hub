import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        mist: "#f5f7f4",
        line: "#dce3dc",
        pine: "#23523e",
        "pine-dark": "#17392d",
        brass: "#a97729",
        coral: "#c45745"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 33, 28, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
