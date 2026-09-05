import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community Resource Portal",
  description: "Map, track, and optimize local resources for sustainable development (SDG 11).",
};

import Navbar from "@/components/Navbar";
import ThemeControls from "@/components/ThemeControls";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Navbar />
        {children}
        <ThemeControls />
      </body>
    </html>
  );
}
