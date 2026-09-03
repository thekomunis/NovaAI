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

export const metadata: Metadata = {
  title: {
    default: "NexAI Store - Marketplace AI Tools & Akun Premium",
    template: "%s | NexAI Store",
  },
  description:
    "Marketplace premium untuk akun dan tools AI terpercaya. ChatGPT, Claude AI, Google AI Pro dengan harga terbaik dan pelayanan cepat.",
  keywords: ["AI", "ChatGPT", "Claude", "Google AI", "marketplace", "tools AI", "akun premium"],
  openGraph: {
    title: "NexAI Store - Marketplace AI Tools & Akun Premium",
    description:
      "Marketplace premium untuk akun dan tools AI terpercaya. ChatGPT, Claude AI, Google AI Pro dengan harga terbaik.",
    type: "website",
    locale: "id_ID",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
