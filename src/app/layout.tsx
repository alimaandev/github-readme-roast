import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "README Roast — AI-Powered GitHub README Critic";
const description =
  "Paste any GitHub repo URL and let AI roast your README with surgical precision. Savage humor, zero mercy.";

export const metadata: Metadata = {
  title,
  description,
  verification: {
    google: "5nLJtITwDEofAn4bHUoXbgkP1HO_BFV7IRiGgObTULI",
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "README Roast",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
