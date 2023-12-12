import { ShellProvider } from "../contexts/shell-provider";
import "./globals.css";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terminal",
  description: "Github navigation in terminal",
};

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

      <body>
        <ShellProvider>
          {children}
        </ShellProvider>
      </body>
    </html>
  );
}
