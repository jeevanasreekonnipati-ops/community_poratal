import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community Resource Portal",
  description: "Map, track, and optimize local resources for sustainable development (SDG 11).",
};

import ThemeControls from "@/components/ThemeControls";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
            ResourcePortal
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/" style={{ color: 'var(--text-secondary)' }}>Home</a>
            <a href="/dashboards/citizen" style={{ color: 'var(--text-secondary)' }}>Citizen</a>
            <a href="/dashboards/admin" style={{ color: 'var(--text-secondary)' }}>Admin</a>
            <a href="/dashboards/optimizer" style={{ color: 'var(--text-secondary)' }}>Optimizer</a>
            <a href="/dashboards/authority" style={{ color: 'var(--text-secondary)' }}>Authority</a>
            <a href="/auth" style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              padding: '0.4rem 1rem', 
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>Sign In</a>
          </div>
        </nav>
        {children}
        <ThemeControls />
      </body>
    </html>
  );
}
