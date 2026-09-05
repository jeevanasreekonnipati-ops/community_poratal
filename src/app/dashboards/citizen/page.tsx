'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './citizen.module.css';
import { useResources, submitResource } from '@/lib/useResources';

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
  school:    '🏫 School / Education',
  hospital:  '🏥 Hospital / Clinic',
  transport: '🚌 Public Transport',
  sanitation:'🚰 Sanitation / Water',
  park:      '🌳 Public Park',
};

export default function CitizenDashboard() {
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

  // ---- Real-time Firestore data ----
  const { resources, loading: dataLoading, error: dataError } = useResources();

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
      setSubmitError('Please use "Use My Current Location" or allow location access first.');
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
      });
      setSuccessMsg('✅ Survey submitted! It will appear on the map after admin approval.');
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

  // Filter by approved only for public map display
  const approvedLocations = resources.filter(r => r.status === 'approved' || r.status === 'pending');

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌍 Citizen Dashboard</h1>
        <p className={styles.subtitle}>
          Report local resources in real time — your data appears live on the map below.
        </p>
        {dataLoading && <div className={styles.liveTag}>⏳ Connecting to live database…</div>}
        {!dataLoading && !dataError && (
          <div className={styles.liveTag}>🟢 Live — {resources.length} resources tracked</div>
        )}
        {dataError && <div className={styles.errorTag}>{dataError}</div>}
      </header>

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
          <h2>📝 Submit a Resource Survey</h2>

          {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
          {submitError && <div className={styles.errorBanner}>{submitError}</div>}

          <form className={styles.form} onSubmit={handleSurveySubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="resourceType">Resource Type *</label>
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
              <label>Your Location *</label>
              <button
                type="button"
                className={styles.locationBtn}
                onClick={handleGetLocation}
                disabled={gpsLoading}
              >
                {gpsLoading ? '📡 Detecting…' : '📍 Use My Current Location (GPS)'}
              </button>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                💡 Or click anywhere on the map to pin a location!
              </p>
              {gpsError && <p className={styles.fieldError}>{gpsError}</p>}
              {selectedPin && (
                <p className={styles.coordInfo}>
                  ✅ Selected: {selectedPin[0].toFixed(5)}, {selectedPin[1].toFixed(5)}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="locationName">Location Name *</label>
              <input
                id="locationName"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Gandhi Primary School"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Feedback / Condition *</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the resource condition, needs, or issues…"
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting…' : '🚀 Submit Survey'}
            </button>
          </form>
        </section>
      </div>

      {/* ---- GOVERNMENT SUPPORT & ELECTED OFFICIALS PANELS ---- */}
      <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <RepresentativesPanel userPosition={userPosition} />
        <GovtSupportPanel />
      </div>
    </main>
  );
}
