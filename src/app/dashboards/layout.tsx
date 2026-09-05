'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: 'Citizen Dashboard', path: '/dashboards/citizen', icon: '🧑‍🌾' },
    { name: 'Secretary (Admin)', path: '/dashboards/admin', icon: '🧑‍💼' },
    { name: 'Optimizer (MRO)', path: '/dashboards/optimizer', icon: '🔭' },
    { name: 'Higher Authority', path: '/dashboards/authority', icon: '🏛️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {/* Sidebar - Similar to GeeksForGeeks Left Navigation */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--card-bg)',
        borderRight: '1px solid var(--border-color)',
        padding: '2rem 1rem',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Portal Navigation
        </div>
        
        {links.map(link => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              href={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.8rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                backgroundColor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
        height: 'calc(100vh - 70px)',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>
    </div>
  );
}
