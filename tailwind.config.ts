import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/ui/pages-components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      background: "#24283BE5",
      black: "#1D202F",
      blue: "#7AA2F7",
      brightBlack: "#414868",
      brightBlue: "#7AA2F7",
      brightCyan: "#7DCFFF",
      brightGreen: "#9ECE6A",
      brightPurple: "#BB9AF7",
      brightRed: "#F7768E",
      brightWhite: "#C0CAF5",
      brightYellow: "#E0AF68",
      cursorColor: "#C0CAF5",
      cyan: "#7DCFFF",
      foreground: "#C0CAF5",
      green: "#9ECE6A",
      purple: "#BB9AF7",
      red: "#F7768E",
      selectionBackground: "#364A82",
      white: "#A9B1D6",
      yellow: "#E0AF68",
      tabBackgroundColor: "#333333",
      tabBackgroundColorOpacity: "#33333380",
      tabTitleColor: "#F6F7F7"
    }
  },
  plugins: [],
};
export default config;
