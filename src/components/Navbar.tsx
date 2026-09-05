'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/auth');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Citizen', href: '/dashboards/citizen' },
    { name: 'Admin', href: '/dashboards/admin' },
    { name: 'Optimizer', href: '/dashboards/optimizer' },
    { name: 'Authority', href: '/dashboards/authority' },
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
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <span style={{ fontSize: '1.5rem' }}>🏛️</span>
        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-color)' }}>
          SachivalayamPortal
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              style={{
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {link.name}
            </Link>
          );
        })}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
            <span style={{
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              background: 'rgba(46, 139, 87, 0.12)',
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontWeight: 600,
            }}>
              👤 {user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              padding: '0.4rem 1.1rem',
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
