import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeControls from "@/components/ThemeControls";

export const metadata: Metadata = {
  title: "Sachivalayam & Community Resource Portal",
  description: "Map, track, and optimize local community resources and governance (SDG 11).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Navbar />
        {children}
        <ThemeControls />
      </body>
    </html>
  );
}
