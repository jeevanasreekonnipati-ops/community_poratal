'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Citizen', path: '/dashboards/citizen' },
    { name: 'Admin', path: '/dashboards/admin' },
    { name: 'Optimizer', path: '/dashboards/optimizer' },
    { name: 'Authority', path: '/dashboards/authority' },
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
          return (
            <Link
              key={link.path}
              href={link.path}
              style={{
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                transition: 'color 0.2s',
              }}
            >
              {link.name}
            </Link>
          );
        })}

        {/* Auth CTA */}
        {!loading && (
          currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👤 {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
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
