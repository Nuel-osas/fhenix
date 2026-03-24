import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/shared/AppShell";

const neueMontreal = localFont({
  src: "../assets/NeueMontreal-Regular.ttf",
  variable: "--font-neue",
  display: "swap",
});

const foundersGrotesk = localFont({
  src: "../assets/FoundersGrotesk-Semibold.ttf",
  variable: "--font-founders",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VeilData — Confidential Data Marketplace",
  description:
    "Buy and sell data privately. Powered by Fhenix Fully Homomorphic Encryption.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${neueMontreal.variable} ${foundersGrotesk.variable} antialiased noise`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
