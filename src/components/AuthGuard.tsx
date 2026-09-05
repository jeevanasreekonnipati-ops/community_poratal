'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true);
      } else {
        // Not logged in — redirect to auth
        router.replace('/auth');
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--primary-color)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontWeight: 600 }}>Checking authentication…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authed) return null;
  return <>{children}</>;
}
