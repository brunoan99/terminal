import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/ui/pages-components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [],
};
export default config;
