import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://mami-ken-cedrick-jimenos-projects.vercel.app"),
);

const title = "Mami — Flood Risk Warning System";
const description =
  "Mamdani fuzzy inference system for flood risk warning, calibrated to the Marikina River (Sto. Niño gauge).";
const banner = {
  url: "/app-banner.png",
  width: 1731,
  height: 909,
  alt: "Mami — Flood Risk Warning System",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mami",
    title,
    description,
    images: [banner],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [banner.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
