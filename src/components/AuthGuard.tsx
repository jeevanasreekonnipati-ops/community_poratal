'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/userProfile';

const ROUTE_ROLE_MAP: Record<string, string> = {
  '/dashboards/citizen': 'citizen',
  '/dashboards/admin': 'admin',
  '/dashboards/optimizer': 'optimizer',
  '/dashboards/authority': 'authority',
};

const ROLE_NAMES: Record<string, string> = {
  citizen: '🧑‍🌾 Citizen',
  admin: '🧑‍💼 Secretary (Admin)',
  optimizer: '🔭 MRO/MPDO (Optimizer)',
  authority: '🏛️ Higher Authority',
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [requiredRole, setRequiredRole] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in -> redirect to login
        router.replace('/auth');
        setChecking(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        // Check if current route requires a specific role
        const expectedRole = ROUTE_ROLE_MAP[pathname];
        if (expectedRole && profile) {
          // Check role permissions:
          // Authority has global oversight, otherwise user must match role
          const isAllowed = profile.role === expectedRole || profile.role === 'authority';

          if (!isAllowed) {
            setRequiredRole(expectedRole);
            setUnauthorized(true);
            setChecking(false);
            return;
          }
        }

        setUnauthorized(false);
      } catch (err) {
        console.error('Error verifying user role:', err);
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, [pathname, router]);

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
        <p style={{ fontWeight: 600 }}>Verifying role & permissions…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If user does not have permission for this specific dashboard
  if (unauthorized && userProfile) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '4rem auto',
        padding: '2.5rem',
        background: 'var(--card-bg)',
        border: '1px solid #fca5a5',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: 800, marginBottom: '0.5rem' }}>
          Access Restricted
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your account is registered as <strong>{ROLE_NAMES[userProfile.role] || userProfile.role}</strong>.
          <br />
          You do not have administrative permissions to view the <strong>{ROLE_NAMES[requiredRole] || requiredRole}</strong> dashboard.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => router.push(`/dashboards/${userProfile.role}`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Go to My Dashboard ({ROLE_NAMES[userProfile.role] || userProfile.role})
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
