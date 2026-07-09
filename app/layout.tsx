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
  title: "Lumanova — Your AI Self-Care Coach",
  description:
    "AI-powered self-care coaching for men. Personalized 90-day plans for skin, grooming, fitness, and confidence. Built for every ethnicity.",
  openGraph: {
    title: "Lumanova — Your AI Self-Care Coach",
    description:
      "AI-powered self-care coaching for men. Personalized 90-day plans for skin, grooming, fitness, and confidence. Built for every ethnicity.",
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
