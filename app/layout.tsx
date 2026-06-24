import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CursorGlow from "@/components/CursorGlow";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumanova — Your AI Glow-Up Coach",
  description:
    "Multi-ethnic looksmaxxing transformation. From day 1 to your peak self. AI-powered glow-up coaching for men.",
  openGraph: {
    title: "Lumanova — Your AI Glow-Up Coach",
    description:
      "Multi-ethnic looksmaxxing transformation. 90 days to your peak self.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="antialiased bg-pure-black text-cream-ivory">
        <Providers>{children}</Providers>
        <CursorGlow />
      </body>
    </html>
  );
}
