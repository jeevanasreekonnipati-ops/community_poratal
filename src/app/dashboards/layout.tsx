'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const links = [
    { name: 'Citizen Dashboard', path: '/dashboards/citizen', icon: '🧑‍🌾' },
    { name: 'Secretary (Admin)', path: '/dashboards/admin', icon: '🧑‍💼' },
    { name: 'Optimizer (MRO)', path: '/dashboards/optimizer', icon: '🔭' },
    { name: 'Higher Authority', path: '/dashboards/authority', icon: '🏛️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
      {/* Sidebar - Similar to GeeksForGeeks Left Navigation */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--card-bg)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 1rem',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Top section: links */}
        <div>
          <div style={{ padding: '0 0.8rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portal Navigation
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                    backgroundColor: isActive ? 'rgba(46, 139, 87, 0.1)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.92rem',
                    borderLeft: isActive ? '3.5px solid var(--primary-color)' : '3.5px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom section: User Info & Sign Out button */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}>
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.6rem 0.8rem',
              backgroundColor: 'var(--bg-color)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(46, 139, 87, 0.15)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}>
                {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
              👤 Guest Session
            </div>
          )}

          {/* Dedicated Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>🚪</span>
            <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
        height: 'calc(100vh - 65px)',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>
    </div>
  );
}
