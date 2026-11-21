import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { IMG } from "@/lib/images";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Traditionally made pure ghee from quality cow's milk and cream. Order Gold Ghee, Silk Ghee or the combo online with Cash on Delivery anywhere in Bangladesh.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Shathi Foods | Pure Ghee Delivered Across Bangladesh", template: "%s | Shathi Foods" },
  description,
  keywords: ["ghee", "pure ghee Bangladesh", "Shathi Foods", "cow ghee", "cash on delivery"],
  icons: { icon: IMG.logo, apple: IMG.logo },
  openGraph: {
    type: "website",
    siteName: "Shathi Foods",
    title: "Shathi Foods | Pure taste. Honest roots.",
    description,
    images: [{ url: IMG.goldGhee, alt: "Shathi Foods Gold Ghee" }],
  },
  twitter: { card: "summary_large_image", title: "Shathi Foods", description, images: [IMG.goldGhee] },
};

export const viewport: Viewport = { themeColor: "#17281F", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
