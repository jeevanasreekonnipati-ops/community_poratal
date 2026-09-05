'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
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

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('');
  const [cityVillage, setCityVillage] = useState('');
  const [role, setRole] = useState<Role>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile?.role && ROLE_ROUTES[profile.role]) {
          router.push(ROLE_ROUTES[profile.role]);
        }
      }
    });
    return () => unsub();
  }, [router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your Full Name.');
        return;
      }
      if (!mobile.trim() || mobile.length < 10) {
        setError('Please enter a valid 10-digit Phone Number.');
        return;
      }
      if (!district.trim()) {
        setError('Please enter your District.');
        return;
      }
      if (!cityVillage.trim()) {
        setError('Please enter your City / Village.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(cred.user.uid);
        if (profile?.role && ROLE_ROUTES[profile.role]) {
          router.push(ROLE_ROUTES[profile.role]);
        } else {
          router.push('/dashboards/citizen');
        }
      } else {
        // Create Account (Registration)
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserProfile({
          uid: cred.user.uid,
          name: name.trim(),
          age: '25',
          mobile: mobile.trim(),
          role,
          village: cityVillage.trim(),
          district: district.trim(),
          state: 'Andhra Pradesh',
          email: email.trim(),
        });
        router.push(ROLE_ROUTES[role]);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please Sign In.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      let profile = await getUserProfile(user.uid);
      if (!profile) {
        // First time Google user - initialize profile
        profile = {
          uid: user.uid,
          name: user.displayName || 'Google User',
          age: '25',
          mobile: user.phoneNumber || '',
          role: 'citizen',
          village: 'Vijayawada',
          district: 'NTR District',
          state: 'Andhra Pradesh',
          email: user.email || '',
        };
        await saveUserProfile(profile);
      }
      router.push(ROLE_ROUTES[profile.role] || '/dashboards/citizen');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.bgOverlay} />
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.logo}>🏛️</div>
          <h1 className={styles.title}>Sachivalayam Portal</h1>
          <p className={styles.subtitle}>Andhra Pradesh Civic & Community Platform</p>
        </div>

        {/* Toggle between Sign In and Create Account */}
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggleTab} ${isLogin ? styles.active : ''}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.toggleTab} ${!isLogin ? styles.active : ''}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        <form className={styles.form} onSubmit={handleEmailAuth}>
          {/* Registration Fields */}
          {!isLogin && (
            <>
              <div className={styles.formGroup}>
                <label>I am registering as</label>
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
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="mobile">Phone Number *</label>
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.formGroup}>
                  <label htmlFor="district">District *</label>
                  <input
                    id="district"
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g. Visakhapatnam / Guntur"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="cityVillage">City / Village / Division *</label>
                  <input
                    id="cityVillage"
                    type="text"
                    value={cityVillage}
                    onChange={e => setCityVillage(e.target.value)}
                    placeholder="e.g. Vijayawada / Guntur"
                    required
                    list="apVillagesList"
                  />
                  <datalist id="apVillagesList">
                    {AP_VILLAGES_AND_DIVISIONS.map(v => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Please wait…' : isLogin ? 'Sign In to Portal' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <span>G</span> Continue with Google
        </button>

        <p className={styles.footerNote}>
          Government of Andhra Pradesh · Sachivalayam Civic System · SDG 11
        </p>
      </div>
    </main>
  );
}
