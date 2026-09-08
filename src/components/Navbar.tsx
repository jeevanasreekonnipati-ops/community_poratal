'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';

const ROLE_LABELS: Record<string, string> = {
  citizen: 'Citizen',
  admin: 'Admin',
  optimizer: 'Optimizer',
  authority: 'Authority',
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('active_user_role');
        sessionStorage.clear();
      }
      await signOut(auth);
      router.push('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', role: 'all' },
    { name: 'Citizen', path: '/dashboards/citizen', role: 'citizen' },
    { name: 'Admin', path: '/dashboards/admin', role: 'admin' },
    { name: 'Optimizer', path: '/dashboards/optimizer', role: 'optimizer' },
    { name: 'Authority', path: '/dashboards/authority', role: 'authority' },
    { name: '📐 2x2 Banner', path: '/banner', role: 'all' },
  ];

  return (
    <nav style={{
      padding: '0.85rem 2rem',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--card-bg)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Brand */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '1.4rem' }}>🏛️</span>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)', letterSpacing: '-0.02em' }}>
          Sachivalayam
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          const isPermitted = !userProfile || link.role === 'all' || userProfile.role === link.role || userProfile.role === 'authority';

          return (
            <Link
              key={link.path}
              href={link.path}
              style={{
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : !isPermitted ? '#9ca3af' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>{link.name}</span>
              {!isPermitted && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
            </Link>
          );
        })}

        {/* Auth status & actions */}
        {!loading && (
          currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(46, 139, 87, 0.1)',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid rgba(46, 139, 87, 0.25)',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {userProfile?.role ? `🧑‍💼 ${ROLE_LABELS[userProfile.role] || userProfile.role}` : '👤 User'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  ({userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0]})
                </span>
              </div>

              <button
                onClick={handleSignOut}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '0.45rem 1.1rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
                marginLeft: '0.5rem',
              }}
            >
              Sign In
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
