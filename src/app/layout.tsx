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
  metadataBase: new URL("https://app-venta.vercel.app"),
  title: {
    default: "POS Evento Minibasket",
    template: "%s | POS Evento",
  },
  description:
    "Punto de venta familiar para bebidas, inflable, caja e inventario del evento.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "POS Evento Minibasket",
    description: "Ventas, inflable, caja e inventario para operar el evento sin enredos.",
    url: "https://app-venta.vercel.app/",
    siteName: "POS Evento",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "POS Evento Minibasket - venta, inflable, caja e inventario",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "POS Evento Minibasket",
    description: "Ventas, inflable, caja e inventario para operar el evento sin enredos.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
