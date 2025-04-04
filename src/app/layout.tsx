import { ShellProvider } from "../ui/contexts/shell-provider";
import "../ui/styles/globals.css";
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
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/icon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/icon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/icon/favicon-16x16.png" />
        <link rel="manifest" href="/assets/images/icon/site.webmanifest" />
      </head>

      <body className={jetBrainsFont.className}>
        <ShellProvider>
          {children}
        </ShellProvider>
      </body>
    </html>
  );
}
