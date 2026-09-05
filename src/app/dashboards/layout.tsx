'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Citizen Dashboard',   path: '/dashboards/citizen',   icon: '🧑‍🌾' },
    { name: 'Secretary (Admin)',    path: '/dashboards/admin',     icon: '🧑‍💼' },
    { name: 'Optimizer (MRO)',      path: '/dashboards/optimizer', icon: '🔭'  },
    { name: 'Higher Authority',     path: '/dashboards/authority', icon: '🏛️' },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/auth');
  };

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: '260px',
          backgroundColor: 'var(--card-bg)',
          borderRight: '1px solid var(--border-color)',
          padding: '1.5rem 0.75rem',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '0 0.75rem', marginBottom: '1rem',
            color: 'var(--text-secondary)', fontSize: '0.75rem',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Portal Navigation
          </div>

          {links.map(link => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.8rem 1rem', borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'rgba(46,139,87,0.1)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Sign Out button at bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.8rem 1rem', borderRadius: '0.5rem', border: 'none',
                background: 'transparent', color: 'var(--danger)', fontWeight: 600,
                fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={{
          flex: 1, padding: '2rem', overflowY: 'auto',
          height: 'calc(100vh - 70px)', position: 'relative', zIndex: 1,
        }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
