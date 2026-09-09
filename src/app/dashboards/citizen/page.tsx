'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './citizen.module.css';
import { useResources, submitResource, updateResourceStatus, ResourceEntry } from '@/lib/useResources';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';

import RepresentativesPanel from '@/components/RepresentativesPanel';
import GovtSupportPanel from '@/components/GovtSupportPanel';
import NoticeBoardBanner from '@/components/NoticeBoardBanner';
import AIAssistantModal from '@/components/AIAssistantModal';
import EmergencyDirectoryModal from '@/components/EmergencyDirectoryModal';

const InteractiveMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      🗺️ Loading interactive map…
    </div>
  ),
});

const TYPE_LABELS: Record<string, string> = {
  sanitation:   '🚰 Sanitation / Water',
  school:       '🏫 School / Education',
  hospital:     '🏥 Hospital / Clinic',
  transport:    '🚌 Public Transport / Roads',
  park:         '🌳 Public Park / Environment',
  gov_support:  '🏛️ Government Support / Welfare',
};

// Preset Andhra Pradesh Locations for instant 1-click pinning
const PRESET_LOCATIONS: { name: string; coords: [number, number] }[] = [
  { name: 'Tirupati (AITS / Rural)', coords: [13.6288, 79.4192] },
  { name: 'Vijayawada (NTR Hub)', coords: [16.5062, 80.6480] },
  { name: 'Visakhapatnam (Coast)', coords: [17.6868, 83.2185] },
  { name: 'Guntur (Market)', coords: [16.3067, 80.4365] },
];

// Quick Problem Templates for 1-click auto-fill
const QUICK_TEMPLATES = [
  {
    label: '💧 Water Pipeline Leak',
    type: 'sanitation',
    name: 'Ward 4 Main Water Pipeline',
    desc: 'Drinking water pipeline ruptured near the junction. Clean drinking water is overflowing onto the street, causing contamination and severe low pressure in surrounding households.',
  },
  {
    label: '💡 Streetlight Outage',
    type: 'transport',
    name: 'Bazaar Street Lighting Grid',
    desc: '4 continuous streetlights are non-functional for the past 5 days. Road is in complete darkness after 7 PM, creating severe safety risks for women and commuters.',
  },
  {
    label: '🛣️ Road Pothole Hazard',
    type: 'transport',
    name: 'Panchayat Link Road (KM 2)',
    desc: 'Large crater-like potholes formed after recent rains. Multiple two-wheeler skids reported. Immediate gravel patching and bitumen recarpeting required.',
  },
  {
    label: '🏥 PHC Medicine Stock',
    type: 'hospital',
    name: 'Primary Health Centre (PHC)',
    desc: 'Essential anti-venom, basic antibiotics, and BP medication out of stock since last week. Patients are forced to travel 15 km to district hospital.',
  },
  {
    label: '🏫 School Roof Repair',
    type: 'school',
    name: 'Zilla Parishad High School',
    desc: 'Ceiling plaster peeling in Class 7 & 8 block. Rainwater seeping through roof during heavy downpours. Urgent structural inspection needed before monsoon.',
  },
];

// Helper: Calculate remaining hours out of 48-Hour SLA
function getSLACountdown(date: Date | null): { hoursLeft: number; label: string; pct: number; color: string } {
  if (!date) return { hoursLeft: 48, label: '48h 00m remaining', pct: 100, color: '#10b981' };
  const now = new Date().getTime();
  const createdMs = new Date(date).getTime();
  const elapsedMs = Math.max(0, now - createdMs);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const hoursLeft = Math.max(0, 48 - elapsedHours);
  const minsLeft = Math.floor((hoursLeft % 1) * 60);

  const pct = Math.max(0, Math.min(100, (hoursLeft / 48) * 100));

  let color = '#10b981';
  if (hoursLeft <= 12) color = '#ef4444';
  else if (hoursLeft <= 24) color = '#f59e0b';

  return {
    hoursLeft,
    label: hoursLeft > 0 ? `${Math.floor(hoursLeft)}h ${minsLeft}m remaining` : '⚠️ SLA Breached (Escalated to MRO)',
    pct,
    color,
  };
}

// Helper: Format friendly timestamp
function formatSubmissionDate(date: Date | null): string {
  if (!date) return 'Just now';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CitizenDashboard() {
  const formRef = useRef<HTMLFormElement>(null);
  const trackerRef = useRef<HTMLElement>(null);

  // ---- User & Session state ----
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [anonCitizenId, setAnonCitizenId] = useState<string>('');

  // ---- Advanced Modals state ----
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showEmergencySOS, setShowEmergencySOS] = useState(false);

  // ---- Form state ----
  const [resourceType, setResourceType]   = useState('sanitation');
  const [locationName, setLocationName]   = useState('');
  const [description,  setDescription]    = useState('');
  const [selectedPin,  setSelectedPin]    = useState<[number, number] | null>([13.6288, 79.4192]);
  const [flyTo,        setFlyTo]          = useState<[number, number] | null>([13.6288, 79.4192]);

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

  // Initialize session token on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('anon_citizen_id');
      if (!sid) {
        sid = `citizen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        sessionStorage.setItem('anon_citizen_id', sid);
      }
      setAnonCitizenId(sid);
    }
  }, []);

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
        setGpsError(`Location notice: ${err.message}. Using default Andhra Pradesh region coordinates.`);
        // Fallback to Tirupati default
        setSelectedPin([13.6288, 79.4192]);
        setFlyTo([13.6288, 79.4192]);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // ---- Preset Location Pick ----
  const handleSelectPresetLocation = (coords: [number, number], name: string) => {
    setSelectedPin(coords);
    setFlyTo(coords);
    if (!locationName) {
      setLocationName(name);
    }
  };

  // ---- Quick Template Apply ----
  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setResourceType(tmpl.type);
    setLocationName(tmpl.name);
    setDescription(tmpl.desc);
    if (!selectedPin) {
      setSelectedPin([13.6288, 79.4192]);
      setFlyTo([13.6288, 79.4192]);
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ---- Submit survey to Firestore + LocalStorage ----
  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePin = selectedPin || [13.6288, 79.4192];
    const effectiveName = locationName.trim() || 'Village Civic Point';

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMsg(null);

    const submitCitizenId = currentUser?.uid || userProfile?.uid || anonCitizenId || 'citizen_user';
    const submitCitizenEmail = currentUser?.email || userProfile?.email || 'citizen@sachivalayam.gov.in';
    const submitCitizenName = userProfile?.name || currentUser?.displayName || 'Citizen Resident';

    try {
      await submitResource({
        type: resourceType,
        lat:  effectivePin[0],
        lng:  effectivePin[1],
        locationName: effectiveName,
        description: description.trim(),
        citizenId: submitCitizenId,
        citizenEmail: submitCitizenEmail,
        citizenName: submitCitizenName,
      });

      setSuccessMsg(`✅ Issue Report "${effectiveName}" submitted successfully! It is now tracking under the 48-Hour SLA countdown below.`);
      setLocationName('');
      setDescription('');
      
      // Scroll to tracker
      setTimeout(() => {
        trackerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err: any) {
      setSubmitError(`Failed to submit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Fast-track Secretary Approval (Demo Simulation) ----
  const handleFastTrackApproval = async (id: string) => {
    await updateResourceStatus(id, 'approved');
    setSuccessMsg('🎉 Issue has been verified and APPROVED by Village Secretariat! It is now live on the public resource map.');
  };

  // Filter public map locations
  const approvedLocations = resources.filter(r => r.status === 'approved' || r.status === 'pending');

  // Filter citizen's personal submissions
  const currentCitizenId = currentUser?.uid || userProfile?.uid || anonCitizenId;
  const currentCitizenEmail = (currentUser?.email || userProfile?.email || '').trim().toLowerCase();

  let mySubmissions = resources.filter(r => {
    if (currentCitizenId && r.citizenId && r.citizenId === currentCitizenId) return true;
    if (currentCitizenEmail && r.citizenEmail && r.citizenEmail.trim().toLowerCase() === currentCitizenEmail) return true;
    if (anonCitizenId && r.citizenId === anonCitizenId) return true;
    return false;
  });

  // If no submissions exist yet for this browser session, show verified demo citizen reports so the tracker is immediately alive
  if (mySubmissions.length === 0) {
    mySubmissions = [
      {
        id: 'demo-citizen-1',
        type: 'sanitation',
        lat: 13.6288,
        lng: 79.4192,
        locationName: 'Panchayat RO Drinking Water Plant, Tirupati',
        description: 'Water filtration motor repaired and operational. 2000 LPH clean drinking water supply restored to Ward 3 & 4.',
        status: 'approved',
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // 26 hours ago
        citizenName: 'Citizen Resident',
      },
      {
        id: 'demo-citizen-2',
        type: 'transport',
        lat: 13.6350,
        lng: 79.4250,
        locationName: 'Temple Street LED Lighting Grid',
        description: 'Reported non-functional streetlights along temple lane. Inspection assigned to electrical assistant.',
        status: 'pending',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        citizenName: 'Citizen Resident',
      },
    ];
  }

  const myApprovedCount = mySubmissions.filter(s => s.status === 'approved').length;
  const myPendingCount  = mySubmissions.filter(s => s.status === 'pending').length;
  const myRejectedCount = mySubmissions.filter(s => s.status === 'rejected').length;

  // Find recently approved issues for notifications
  const approvedNotifications = mySubmissions.filter(
    s => s.status === 'approved' && !dismissedNotifs.includes(s.id)
  );

  return (
    <main className={styles.container}>
      {/* ── LIVE VILLAGE NOTICE BOARD TICKER ── */}
      <NoticeBoardBanner />

      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 className={styles.title}>🌍 Citizen Dashboard & Governance Portal</h1>
            <p className={styles.subtitle}>
              Report local civic issues, track 48-hour SLA resolutions, and explore welfare schemes with Andhra Pradesh Secretariat.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAIAssistant(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              <span>🤖</span>
              <span>AI Scheme & Grievance Assistant</span>
            </button>

            <button
              onClick={() => setShowEmergencySOS(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              <span>🚨</span>
              <span>1-Tap SOS Directory (112, 108, 1902)</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {dataLoading && <div className={styles.liveTag}>⏳ Connecting to live database…</div>}
          {!dataLoading && (
            <div className={styles.liveTag}>🟢 Live — {approvedLocations.length} community resources tracked in GIS grid</div>
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Session: <strong>{currentUser?.email || (userProfile?.name ? userProfile.name : 'Citizen Resident')}</strong>
          </span>
        </div>
      </header>

      {/* ── AI ASSISTANT MODAL ── */}
      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onAutoFillGrievance={(draft) => {
          setLocationName(draft.locationName);
          setResourceType(draft.type);
          setDescription(draft.description);
          setSelectedPin([13.6288, 79.4192]);
          setFlyTo([13.6288, 79.4192]);
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      {/* ── EMERGENCY SOS DIRECTORY MODAL ── */}
      <EmergencyDirectoryModal
        isOpen={showEmergencySOS}
        onClose={() => setShowEmergencySOS(false)}
      />

      {/* ── APPROVAL NOTIFICATION BANNER ── */}
      {approvedNotifications.length > 0 && (
        <div className={styles.notificationBanner} style={{
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #10b981',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <div className={styles.notificationContent} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🎉</span>
            <div>
              <strong style={{ color: '#065f46', fontSize: '0.98rem' }}>Good News! Issue Approved by Village Secretary:</strong>
              <div style={{ fontSize: '0.88rem', color: '#1f2937', marginTop: '0.15rem' }}>
                Your report <strong>"{approvedNotifications[0].locationName}"</strong> has been officially <strong>APPROVED</strong> and verified on the live public resource map!
              </div>
            </div>
          </div>
          <button
            className={styles.dismissBtn}
            onClick={() => setDismissedNotifs(prev => [...prev, approvedNotifications[0].id])}
            style={{
              padding: '0.35rem 0.8rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Dismiss ✕
          </button>
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* ---- MAP ---- */}
        <section className={`glass-panel ${styles.mapSection}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ margin: 0 }}>
              🗺️ Live Community Map
              {approvedLocations.length > 0 && (
                <span className={styles.markerCount}>{approvedLocations.length} locations</span>
              )}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              💡 Tap any marker for full details or click map to place a new pin
            </div>
          </div>

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

          {/* Quick Preset Location Chips */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              📍 Quick Focus Region:
            </div>
            <div className={styles.chipGroup}>
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={styles.quickChip}
                  onClick={() => handleSelectPresetLocation(preset.coords, preset.name)}
                >
                  📍 {preset.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---- SURVEY FORM ---- */}
        <section className={`glass-panel ${styles.surveySection}`}>
          <h2>📝 Report an Issue / Resource</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '-0.3rem 0 0.75rem 0' }}>
            Directly submits your petition to the Village Secretariat with automated 48-Hour SLA tracking.
          </p>

          {/* Quick Template Autofill Chips */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              ⚡ Popular Grievance Templates (1-Tap Auto-fill):
            </div>
            <div className={styles.chipGroup}>
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  className={styles.quickChip}
                  onClick={() => handleApplyTemplate(tmpl)}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
          {submitError && <div className={styles.errorBanner}>{submitError}</div>}

          <form ref={formRef} className={styles.form} onSubmit={handleSurveySubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="resourceType">Resource / Issue Category *</label>
              <select
                id="resourceType"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                required
              >
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Location on Map *</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={styles.locationBtn}
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  {gpsLoading ? '📡 Detecting…' : '📍 Use My Current Location (GPS)'}
                </button>
              </div>
              
              {gpsError && <p className={styles.fieldError}>{gpsError}</p>}
              {selectedPin && (
                <p className={styles.coordInfo} style={{ marginTop: '0.35rem' }}>
                  ✅ Selected Coordinates: <strong>{selectedPin[0].toFixed(4)}, {selectedPin[1].toFixed(4)}</strong>
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="locationName">Location / Landmark Name *</label>
              <input
                id="locationName"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Gandhi Primary School / Main Bazaar RO Plant"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Detailed Description & Urgent Requirements *</label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current condition, severity, and required action by village administration…"
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting to Secretariat…' : '🚀 Submit Issue Report (48h SLA)'}
            </button>
          </form>
        </section>
      </div>

      {/* ── CITIZEN SUBMISSION HISTORY & STATUS TRACKER ── */}
      <section ref={trackerRef} className={`glass-panel ${styles.historySection}`} style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>
            <span>📋 My Submitted Issues & 48-Hour SLA Status Tracker</span>
          </h2>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            Total Submissions: {mySubmissions.length}
          </span>
        </div>

        {/* Stats summary bar */}
        <div className={styles.statsBar}>
          <div className={styles.statBadge}>
            <span>📊 Total Issues:</span>
            <strong>{mySubmissions.length}</strong>
          </div>
          <div className={styles.statBadge} style={{ borderColor: 'var(--success)' }}>
            <span>✅ Approved & Resolved:</span>
            <strong style={{ color: 'var(--success)' }}>{myApprovedCount}</strong>
          </div>
          <div className={styles.statBadge} style={{ borderColor: '#f59e0b' }}>
            <span>⏳ In 48h SLA Review:</span>
            <strong style={{ color: '#b45309' }}>{myPendingCount}</strong>
          </div>
          <div className={styles.statBadge} style={{ borderColor: 'var(--danger)' }}>
            <span>❌ Rejected:</span>
            <strong style={{ color: 'var(--danger)' }}>{myRejectedCount}</strong>
          </div>
        </div>

        {/* Issues list */}
        <div className={styles.issueGrid}>
          {mySubmissions.map((issue) => {
            const isApproved = issue.status === 'approved';
            const isRejected = issue.status === 'rejected';
            const isPending = !isApproved && !isRejected;

            const statusClass = isApproved
              ? styles.statusTagApproved
              : isRejected
              ? styles.statusTagRejected
              : styles.statusTagPending;

            const statusText = isApproved
              ? '✅ Approved & Verified'
              : isRejected
              ? '❌ Rejected / Needs Info'
              : '⏳ Under Secretary Triage';

            const sla = getSLACountdown(issue.createdAt);

            return (
              <div key={issue.id} className={styles.issueCard}>
                <div className={styles.issueHead}>
                  <div className={styles.issueTitle}>
                    {TYPE_LABELS[issue.type]?.split(' ')[0] || '📍'} {issue.locationName}
                  </div>
                  <span className={statusClass}>{statusText}</span>
                </div>

                <div className={styles.issueMeta}>
                  <span>📅 Submitted: {formatSubmissionDate(issue.createdAt)}</span>
                </div>

                {/* 4-Stage Lifecycle Stepper */}
                <div className={styles.lifecycleStepper}>
                  <span className={`${styles.stepPill} ${styles.stepPillDone}`}>
                    1. Submitted
                  </span>
                  <span>➔</span>
                  <span className={`${styles.stepPill} ${isApproved ? styles.stepPillDone : styles.stepPillActive}`}>
                    2. Secretary Triage
                  </span>
                  <span>➔</span>
                  <span className={`${styles.stepPill} ${isApproved ? styles.stepPillDone : styles.stepPill}`}>
                    3. Field Work
                  </span>
                  <span>➔</span>
                  <span className={`${styles.stepPill} ${isApproved ? styles.stepPillDone : styles.stepPill}`}>
                    4. Resolved
                  </span>
                </div>

                {/* 48-Hour SLA Countdown Box (for pending issues) */}
                {isPending && (
                  <div className={styles.slaBox}>
                    <div className={styles.slaHeader}>
                      <span style={{ color: sla.color }}>⏱️ 48-Hour SLA Window:</span>
                      <span style={{ color: sla.color }}>{sla.label}</span>
                    </div>
                    <div className={styles.slaBarTrack}>
                      <div
                        className={styles.slaBarFill}
                        style={{ width: `${sla.pct}%`, backgroundColor: sla.color }}
                      />
                    </div>
                  </div>
                )}

                <p className={styles.issueDesc}>{issue.description}</p>

                <div className={styles.issueCoords}>
                  📍 Coordinates: {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}
                </div>

                {/* Interactive Action Buttons */}
                <div className={styles.issueActionBtns}>
                  <button
                    type="button"
                    className={styles.btnMapFocus}
                    onClick={() => {
                      setFlyTo([issue.lat, issue.lng]);
                      setSelectedPin([issue.lat, issue.lng]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    🗺️ View Live on Map
                  </button>

                  {isPending && (
                    <button
                      type="button"
                      className={styles.btnFastTrack}
                      onClick={() => handleFastTrackApproval(issue.id)}
                      title="Simulate Secretary verification in real time"
                    >
                      ⚡ Fast-Track Secretary Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- GOVERNMENT SUPPORT & ELECTED OFFICIALS PANELS ---- */}
      <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <RepresentativesPanel userPosition={userPosition} />
        <GovtSupportPanel />
      </div>
    </main>
  );
}
