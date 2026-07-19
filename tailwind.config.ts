import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A4A", // navy đậm - văn bản chính, header
        parchment: "#F7F3EC", // nền kem nhạt
        bordeaux: "#8C2F35", // đỏ rượu vang - nhấn
        gold: "#C9A227", // vàng đồng - nhấn phụ
        mist: "#DDE3E8", // viền, nền phụ
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
