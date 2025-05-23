import React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBarWrapper from "./components/navbar/NavBarWrapper";
import dynamic from 'next/dynamic';
import { URL } from "url";
import ParticlesBackgroundWrapper from './components/ParticlesBackgroundWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Peer2Stream",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  description: "Peer2Stream - Your Peer-to-Peer Streaming Platform",
  openGraph: {
    title: "Peer2Stream",
    description: "Peer2Stream - Your Peer-to-Peer Streaming Platform",
    url: "https://peer2stream.live",
    siteName: "Peer2Stream",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://peer2stream.live"),
};

// Cargamos MobileBlocker como un componente dinámico del lado del cliente
// para evitar problemas de hidratación
const MobileBlocker = dynamic(
  () => import('./components/MobileBlocker'),
  { ssr: true }
);

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ minHeight: "100vh" }}
      >
        <MobileBlocker />
        <ParticlesBackgroundWrapper />
        <NavBarWrapper>{children}</NavBarWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
