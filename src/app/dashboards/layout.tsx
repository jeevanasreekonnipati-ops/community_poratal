'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';
import AuthGuard from '@/components/AuthGuard';

const ROLE_LABELS: Record<string, string> = {
  citizen: '🧑‍🌾 Citizen',
  admin: '🧑‍💼 Secretary (Admin)',
  optimizer: '🔭 MRO/MPDO (Optimizer)',
  authority: '🏛️ Higher Authority',
};

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      router.replace('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const links = [
    { name: 'Citizen Dashboard',   path: '/dashboards/citizen',   icon: '🧑‍🌾', role: 'citizen' },
    { name: 'Secretary (Admin)',    path: '/dashboards/admin',     icon: '🧑‍💼', role: 'admin' },
    { name: 'Optimizer (MRO)',      path: '/dashboards/optimizer', icon: '🔭',  role: 'optimizer' },
    { name: 'Higher Authority',     path: '/dashboards/authority', icon: '🏛️', role: 'authority' },
  ];

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* ── Sidebar (GeeksForGeeks style) ── */}
        <aside style={{
          width: '280px',
          backgroundColor: 'var(--card-bg)',
          borderRight: '1px solid var(--border-color)',
          padding: '1.5rem 0.85rem',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
        }}>
          <div>
            <div style={{
              padding: '0 0.75rem', marginBottom: '1rem',
              color: 'var(--text-secondary)', fontSize: '0.75rem',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Portal Navigation
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {links.map(link => {
                const isActive = pathname === link.path;
                const isUserRole = userProfile?.role === link.role || userProfile?.role === 'authority';
                const isLocked = userProfile && !isUserRole;

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: isActive ? 'var(--primary-color)' : isLocked ? '#9ca3af' : 'var(--text-primary)',
                      backgroundColor: isActive ? 'rgba(46,139,87,0.1)' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      borderLeft: isActive ? '3.5px solid var(--primary-color)' : '3.5px solid transparent',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      opacity: isLocked ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                      <span>{link.name}</span>
                    </div>
                    {isLocked && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }} title="Restricted to authorized roles">
                        🔒
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User profile info & Sign Out */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {currentUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.75rem',
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
                  {(userProfile?.name?.[0] || currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                    {userProfile?.role ? ROLE_LABELS[userProfile.role] : 'Citizen'}
                  </div>
                </div>
              </div>
            )}

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
              }}
            >
              <span>🚪</span>
              <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
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
