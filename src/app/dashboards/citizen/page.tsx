'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './citizen.module.css';
import { useResources, submitResource, ResourceEntry } from '@/lib/useResources';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';

import RepresentativesPanel from '@/components/RepresentativesPanel';
import GovtSupportPanel from '@/components/GovtSupportPanel';

const InteractiveMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      🗺️ Loading map…
    </div>
  ),
});

const TYPE_LABELS: Record<string, string> = {
  school:       '🏫 School / Education',
  hospital:     '🏥 Hospital / Clinic',
  transport:    '🚌 Public Transport',
  sanitation:   '🚰 Sanitation / Water',
  park:         '🌳 Public Park',
  gov_support:  '🏛️ Government Support',
};

// Helper: Calculate days elapsed / counting
function getDaysElapsed(date: Date | null): string {
  if (!date) return 'Recently';
  const now = new Date().getTime();
  const diffMs = now - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `Today (${diffHours}h ago)`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

// Helper: Format readable date & time
function formatDateTime(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CitizenDashboard() {
  // ---- User & Session state ----
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ---- Form state ----
  const [resourceType, setResourceType]   = useState('');
  const [locationName, setLocationName]   = useState('');
  const [description,  setDescription]    = useState('');
  const [selectedPin,  setSelectedPin]    = useState<[number, number] | null>(null);
  const [flyTo,        setFlyTo]          = useState<[number, number] | null>(null);

  // ---- GPS state ----
  const [userPosition, setUserPosition]   = useState<[number, number] | null>(null);
  const [gpsLoading,   setGpsLoading]     = useState(false);
  const [gpsError,     setGpsError]       = useState<string | null>(null);

  // ---- Submission state ----
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ---- Notifications state ----
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);

  // ---- Real-time Firestore data ----
  const { resources, loading: dataLoading, error: dataError } = useResources();

  // Load active user profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        const cached = localStorage.getItem('userProfile');
        if (cached) {
          try { setUserProfile(JSON.parse(cached)); } catch {}
        }
      }
    });
    return () => unsub();
  }, []);

  // ---- GPS: detect user location ----
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(coords);
        setSelectedPin(coords);
        setFlyTo(coords);
        setGpsLoading(false);
        setGpsError(null);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ---- Submit survey to Firestore ----
  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPin) {
      setSubmitError('Please use "Use My Current Location" or click on the map to place a pin.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMsg(null);
    try {
      await submitResource({
        type: resourceType,
        lat:  selectedPin[0],
        lng:  selectedPin[1],
        locationName,
        description,
        citizenId: currentUser?.uid || userProfile?.uid || 'guest-citizen',
        citizenEmail: currentUser?.email || userProfile?.email || 'citizen@portal.local',
        citizenName: userProfile?.name || currentUser?.displayName || 'Citizen',
      });
      setSuccessMsg('✅ Survey submitted! It is now recorded in your issue history below and awaiting secretary verification.');
      setResourceType('');
      setLocationName('');
      setDescription('');
      setSelectedPin(null);
    } catch (err: any) {
      setSubmitError(`Failed to submit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter public map locations
  const approvedLocations = resources.filter(r => r.status === 'approved' || r.status === 'pending');

  // Filter citizen's personal issue submissions (Strictly private per account)
  const currentCitizenId = currentUser?.uid || userProfile?.uid;
  const currentCitizenEmail = currentUser?.email || userProfile?.email;

  const mySubmissions = resources.filter(r => {
    if (!currentCitizenId && !currentCitizenEmail) return false;
    if (currentCitizenId && r.citizenId === currentCitizenId) return true;
    if (currentCitizenEmail && r.citizenEmail?.toLowerCase() === currentCitizenEmail.toLowerCase()) return true;
    return false;
  });

  const myApprovedCount = mySubmissions.filter(s => s.status === 'approved').length;
  const myPendingCount  = mySubmissions.filter(s => s.status === 'pending').length;
  const myRejectedCount = mySubmissions.filter(s => s.status === 'rejected').length;

  // Find recently approved issues for notifications
  const approvedNotifications = mySubmissions.filter(
    s => s.status === 'approved' && !dismissedNotifs.includes(s.id)
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌍 Citizen Dashboard</h1>
        <p className={styles.subtitle}>
          Report local issues in real time & track your submission status directly with village administration.
        </p>
        {dataLoading && <div className={styles.liveTag}>⏳ Connecting to live database…</div>}
        {!dataLoading && !dataError && (
          <div className={styles.liveTag}>🟢 Live — {resources.length} community resources tracked</div>
        )}
        {dataError && <div className={styles.errorTag}>{dataError}</div>}
      </header>

      {/* ── APPROVAL NOTIFICATION BANNER ── */}
      {approvedNotifications.length > 0 && (
        <div className={styles.notificationBanner}>
          <div className={styles.notificationContent}>
            <span className={styles.notificationIcon}>🎉</span>
            <div>
              <strong>Good News! Issue Approved by Secretary:</strong>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Your submitted issue <strong>"{approvedNotifications[0].locationName}"</strong> has been officially <strong>APPROVED</strong> and is now visible on the live public resource map!
              </div>
            </div>
          </div>
          <button
            className={styles.dismissBtn}
            onClick={() => setDismissedNotifs(prev => [...prev, approvedNotifications[0].id])}
          >
            Dismiss ✕
          </button>
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* ---- MAP ---- */}
        <section className={`glass-panel ${styles.mapSection}`}>
          <h2>
            Live Resource Map
            {approvedLocations.length > 0 && (
              <span className={styles.markerCount}>{approvedLocations.length} markers</span>
            )}
          </h2>
          <div className={styles.legend}>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <span key={key} className={styles.legendItem} data-type={key}>
                {label}
              </span>
            ))}
          </div>
          <div className={styles.mapContainer}>
            <InteractiveMap
              locations={approvedLocations}
              userPosition={userPosition}
              flyTo={flyTo}
              selectedPin={selectedPin}
              onMapClick={(lat, lng) => {
                setSelectedPin([lat, lng]);
                setFlyTo([lat, lng]);
              }}
            />
          </div>
        </section>

        {/* ---- SURVEY FORM ---- */}
        <section className={`glass-panel ${styles.surveySection}`}>
          <h2>📝 Report an Issue / Resource</h2>

          {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
          {submitError && <div className={styles.errorBanner}>{submitError}</div>}

          <form className={styles.form} onSubmit={handleSurveySubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="resourceType">Resource / Issue Type *</label>
              <select
                id="resourceType"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                required
              >
                <option value="" disabled>Select type…</option>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Location on Map *</label>
              <button
                type="button"
                className={styles.locationBtn}
                onClick={handleGetLocation}
                disabled={gpsLoading}
              >
                {gpsLoading ? '📡 Detecting…' : '📍 Use My Current Location (GPS)'}
              </button>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                💡 Or tap/click directly on the map to pin exact location!
              </p>
              {gpsError && <p className={styles.fieldError}>{gpsError}</p>}
              {selectedPin && (
                <p className={styles.coordInfo}>
                  ✅ Pinned: {selectedPin[0].toFixed(5)}, {selectedPin[1].toFixed(5)}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="locationName">Location / Facility Name *</label>
              <input
                id="locationName"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Gandhi Primary School / RO Water Plant"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Issue Details / Condition Description *</label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current condition, problems, or needs…"
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting to Secretariat…' : '🚀 Submit Issue Report'}
            </button>
          </form>
        </section>
      </div>

      {/* ── CITIZEN SUBMISSION HISTORY & STATUS TRACKER ── */}
      <section className={`glass-panel ${styles.historySection}`}>
        <h2>
          <span>📋 My Submitted Issues & Status Tracker</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Total: {mySubmissions.length}
          </span>
        </h2>

        {/* Stats summary bar */}
        <div className={styles.statsBar}>
          <div className={styles.statBadge}>
            <span>📊 Total Issues:</span>
            <strong>{mySubmissions.length}</strong>
          </div>
          <div className={styles.statBadge} style={{ borderColor: 'var(--success)' }}>
            <span>✅ Approved:</span>
            <strong style={{ color: 'var(--success)' }}>{myApprovedCount}</strong>
          </div>
          <div className={styles.statBadge} style={{ borderColor: '#f59e0b' }}>
            <span>⏳ In Review / Pending:</span>
            <strong style={{ color: '#b45309' }}>{myPendingCount}</strong>
          </div>
          <div className={styles.statBadge} style={{ borderColor: 'var(--danger)' }}>
            <span>❌ Rejected:</span>
            <strong style={{ color: 'var(--danger)' }}>{myRejectedCount}</strong>
          </div>
        </div>

        {/* Issues list */}
        {mySubmissions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem 0' }}>
            You have not submitted any issues yet. Use the form above to report local infrastructure issues!
          </p>
        ) : (
          <div className={styles.issueGrid}>
            {mySubmissions.map(issue => {
              const statusClass =
                issue.status === 'approved'
                  ? styles.statusTagApproved
                  : issue.status === 'rejected'
                  ? styles.statusTagRejected
                  : styles.statusTagPending;

              const statusText =
                issue.status === 'approved'
                  ? '✅ Approved'
                  : issue.status === 'rejected'
                  ? '❌ Rejected'
                  : '⏳ Pending Review';

              return (
                <div key={issue.id} className={styles.issueCard}>
                  <div className={styles.issueHead}>
                    <div className={styles.issueTitle}>
                      {TYPE_LABELS[issue.type]?.split(' ')[0] || '📍'} {issue.locationName}
                    </div>
                    <span className={statusClass}>{statusText}</span>
                  </div>

                  <div className={styles.issueMeta}>
                    <span>📅 {formatDateTime(issue.createdAt)}</span>
                    <span className={styles.daysAgoBadge}>⏱️ {getDaysElapsed(issue.createdAt)}</span>
                  </div>

                  <p className={styles.issueDesc}>{issue.description}</p>

                  <div className={styles.issueCoords}>
                    📍 Coordinates: {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---- GOVERNMENT SUPPORT & ELECTED OFFICIALS PANELS ---- */}
      <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <RepresentativesPanel userPosition={userPosition} />
        <GovtSupportPanel />
      </div>
    </main>
  );
}
