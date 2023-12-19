import { ShellProvider } from "../contexts/shell-provider";
import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local"

export const metadata: Metadata = {
  title: "Terminal",
  description: "Github navigation in terminal",
};

const jetBrainsFont = localFont({
  src: "../../public/assets/fonts/JetBrainsMonoNLNerdFont-Regular.ttf",
  display: "auto",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/images/favicon.ico" />
      </head>

      <body className={jetBrainsFont.className}>
        <ShellProvider>
          {children}
        </ShellProvider>
      </body>
    </html>
  );
}
