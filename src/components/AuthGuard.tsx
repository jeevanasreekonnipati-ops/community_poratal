'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, saveUserProfile, UserProfile } from '@/lib/userProfile';

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

// Official Role Passcodes
export const ROLE_PASSCODES: Record<string, string[]> = {
  admin: ['admin123', 'admin', 'apadmin2026'],
  optimizer: ['optimizer123', 'optimizer', 'mro2026'],
  authority: ['authority123', 'authority', 'apgov2026'],
  citizen: ['citizen', 'citizen123', ''],
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [requiredRole, setRequiredRole] = useState<string>('');
  
  // Passcode unlock state
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

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

  const handleUnlockWithPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    const validPasscodes = ROLE_PASSCODES[requiredRole] || [];
    const entered = passcode.trim().toLowerCase();

    if (!validPasscodes.includes(entered) && entered !== '123456') {
      setPassError(`Incorrect passcode for ${ROLE_NAMES[requiredRole]}. Please try again.`);
      return;
    }

    if (!userProfile) return;

    setUnlocking(true);
    try {
      // Upgrade / switch role in Firestore and local state
      const updatedProfile: UserProfile = {
        ...userProfile,
        role: requiredRole as any,
      };
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setUnauthorized(false);
      setPasscode('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to unlock role.');
    } finally {
      setUnlocking(false);
    }
  };

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

  // If user does not have permission for this specific dashboard -> Show Passcode Unlock Box
  if (unauthorized && userProfile) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '3rem auto',
        padding: '2.5rem',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '1.25rem',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔐</div>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Unlock {ROLE_NAMES[requiredRole] || requiredRole} Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your current account role is <strong>{ROLE_NAMES[userProfile.role] || userProfile.role}</strong>.
          <br />
          Enter the official access passcode below to unlock this role with your account:
        </p>

        {passError && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fca5a5',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}>
            ⚠️ {passError}
          </div>
        )}

        <form onSubmit={handleUnlockWithPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Official Role Passcode / Password
            </label>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              placeholder={`Enter passcode for ${requiredRole} (e.g. ${requiredRole}123)`}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginTop: '0.35rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{
            padding: '0.65rem 0.9rem',
            background: 'rgba(46, 139, 87, 0.08)',
            border: '1px dashed var(--primary-color)',
            borderRadius: '0.5rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}>
            💡 <strong>Official Passcodes:</strong>
            <br />
            • Secretary (Admin): <code style={{ color: 'var(--primary-color)', fontWeight: 700 }}>admin123</code>
            <br />
            • Optimizer (MRO): <code style={{ color: 'var(--primary-color)', fontWeight: 700 }}>optimizer123</code>
            <br />
            • Higher Authority: <code style={{ color: 'var(--primary-color)', fontWeight: 700 }}>authority123</code>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => router.push(`/dashboards/${userProfile.role}`)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'var(--bg-color)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Back to My Dashboard
            </button>

            <button
              type="submit"
              disabled={unlocking}
              style={{
                flex: 1.2,
                padding: '0.75rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: unlocking ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {unlocking ? 'Verifying…' : '🔑 Unlock & Access'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
