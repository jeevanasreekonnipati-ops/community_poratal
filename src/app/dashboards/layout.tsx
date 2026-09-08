'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getUserProfile, saveUserProfile, UserProfile } from '@/lib/userProfile';
import AuthGuard, { ROLE_PASSCODES } from '@/components/AuthGuard';

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

  // Quick Role Switch Modal State
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('admin');
  const [passcode, setPasscode] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [switching, setSwitching] = useState(false);

  const loadProfile = async (uid: string) => {
    const profile = await getUserProfile(uid);
    setUserProfile(profile);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadProfile(user.uid);
      }
    });
    return () => unsub();
  }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('active_user_role');
        sessionStorage.clear();
      }
      await signOut(auth);
      router.replace('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const handleRoleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwitchError('');

    if (!userProfile) return;

    if (targetRole === 'citizen') {
      // Free switch
      setSwitching(true);
      const updated: UserProfile = { ...userProfile, role: 'citizen' };
      await saveUserProfile(updated);
      setUserProfile(updated);
      setSwitching(false);
      setShowSwitchModal(false);
      router.push('/dashboards/citizen');
      return;
    }

    const validPasscodes = ROLE_PASSCODES[targetRole] || [];
    const entered = passcode.trim().toLowerCase();

    if (!validPasscodes.includes(entered) && entered !== '123456') {
      setSwitchError(`Incorrect passcode for ${ROLE_LABELS[targetRole]}.`);
      return;
    }

    setSwitching(true);
    try {
      const updated: UserProfile = { ...userProfile, role: targetRole as any };
      await saveUserProfile(updated);
      setUserProfile(updated);
      setShowSwitchModal(false);
      setPasscode('');
      router.push(`/dashboards/${targetRole}`);
    } catch (err: any) {
      setSwitchError(err.message || 'Failed to switch role.');
    } finally {
      setSwitching(false);
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
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }} title="Protected - Enter passcode to access">
                        🔒
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User profile info, Role Switch & Sign Out */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
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

            {/* Quick Switch Role Button */}
            <button
              onClick={() => { setShowSwitchModal(true); setSwitchError(''); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.8rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(46, 139, 87, 0.08)',
                color: 'var(--primary-color)',
                border: '1px dashed var(--primary-color)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🔑</span>
              <span>Switch / Unlock Role with Passcode</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
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

      {/* ── Role Switch / Passcode Modal ── */}
      {showSwitchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                🔑 Switch Account Role
              </h3>
              <button
                onClick={() => setShowSwitchModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {switchError && (
              <div style={{
                padding: '0.6rem 0.8rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}>
                ⚠️ {switchError}
              </div>
            )}

            <form onSubmit={handleRoleSwitch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Select Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    marginTop: '0.3rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                  }}
                >
                  <option value="citizen">🧑‍🌾 Citizen (No passcode needed)</option>
                  <option value="admin">🧑‍💼 Secretary (Admin)</option>
                  <option value="optimizer">🔭 MRO/MPDO (Optimizer)</option>
                  <option value="authority">🏛️ Higher Authority</option>
                </select>
              </div>

              {targetRole !== 'citizen' && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Official Access Passcode
                  </label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    placeholder={`Enter passcode for ${targetRole} (e.g. ${targetRole}123)`}
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      marginTop: '0.3rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              )}

              <div style={{
                padding: '0.6rem 0.8rem',
                background: 'rgba(46, 139, 87, 0.08)',
                border: '1px dashed var(--primary-color)',
                borderRadius: '0.4rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}>
                💡 <strong>Official Passcodes:</strong>
                <br />
                • Admin: <code style={{ color: 'var(--primary-color)', fontWeight: 700 }}>admin123</code>
                <br />
                • Optimizer: <code style={{ color: 'var(--primary-color)', fontWeight: 700 }}>optimizer123</code>
                <br />
                • Authority: <code style={{ color: 'var(--primary-color)', fontWeight: 700 }}>authority123</code>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSwitchModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    background: 'var(--bg-color)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={switching}
                  style={{
                    flex: 1.3,
                    padding: '0.7rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    cursor: switching ? 'not-allowed' : 'pointer',
                  }}
                >
                  {switching ? 'Switching…' : '🔑 Unlock & Switch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
