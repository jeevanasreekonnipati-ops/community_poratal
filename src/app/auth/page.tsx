'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
} from 'firebase/auth';
import { saveUserProfile, getUserProfile } from '@/lib/userProfile';
import { AP_VILLAGES_AND_DIVISIONS } from '@/lib/representatives';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

type Role = 'citizen' | 'admin' | 'optimizer' | 'authority';

const ROLE_LABELS: Record<Role, string> = {
  citizen: '🧑‍🌾 Citizen',
  admin: '🧑‍💼 Secretary (Admin)',
  optimizer: '🔭 MRO/MPDO (Optimizer)',
  authority: '🏛️ Higher Authority',
};

const ROLE_ROUTES: Record<Role, string> = {
  citizen: '/dashboards/citizen',
  admin: '/dashboards/admin',
  optimizer: '/dashboards/optimizer',
  authority: '/dashboards/authority',
};

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('citizen');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          router.push(ROLE_ROUTES[profile.role]);
        } else {
          // New Google user — need to complete profile
          setIsLogin(false);
          setEmail(user.email || '');
          setName(user.displayName || '');
          setError('Please complete your profile below to finish sign-up.');
        }
      }
    });
    return () => unsub();
  }, [router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(cred.user.uid);
        if (profile) {
          router.push(ROLE_ROUTES[profile.role]);
        } else {
          setError('Profile not found. Please contact support.');
        }
      } else {
        if (!name || !mobile || !age || !village) {
          setError('Please fill all fields to register.');
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserProfile({
          uid: cred.user.uid,
          name, age, mobile, role, village,
          district: district || village,
          state: 'Andhra Pradesh',
          email,
        });
        router.push(ROLE_ROUTES[role]);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // It will redirect the page, so no code runs after this
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.bgOverlay} />
      <div className={`${styles.authCard}`}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.logo}>🏛️</div>
          <h1 className={styles.title}>Sachivalayam Portal</h1>
          <p className={styles.subtitle}>Andhra Pradesh Social Service System</p>
        </div>

        {/* Toggle */}
        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggleTab} ${isLogin ? styles.active : ''}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >Sign In</button>
          <button
            className={`${styles.toggleTab} ${!isLogin ? styles.active : ''}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >Register</button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form className={styles.form} onSubmit={handleEmailAuth}>
          {/* Registration-only fields */}
          {!isLogin && (
            <>
              <div className={styles.formGroup}>
                <label>I am a</label>
                <div className={styles.roleGrid}>
                  {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`${styles.roleBtn} ${role === r ? styles.roleSelected : ''}`}
                      onClick={() => setRole(r)}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="age">Age</label>
                  <input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" min="1" max="120" required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="mobile">Mobile Number</label>
                <input id="mobile" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile" pattern="[0-9]{10}" required />
              </div>

              <div className={styles.row2}>
                <div className={styles.formGroup}>
                  <label htmlFor="village">Village / Division</label>
                  <select id="village" value={village} onChange={e => setVillage(e.target.value)} required>
                    <option value="">Select...</option>
                    {AP_VILLAGES_AND_DIVISIONS.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="district">District</label>
                  <input id="district" type="text" value={district} onChange={e => setDistrict(e.target.value)} placeholder="District" />
                </div>
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}><span>OR</span></div>

        <button type="button" className={styles.googleBtn} onClick={handleGoogleSignIn} disabled={loading}>
          <span>G</span> Sign {isLogin ? 'in' : 'up'} with Google
        </button>

        <p className={styles.footerNote}>
          State of Andhra Pradesh · Sachivalayam Initiative · SDG 11
        </p>
      </div>
    </main>
  );
}
