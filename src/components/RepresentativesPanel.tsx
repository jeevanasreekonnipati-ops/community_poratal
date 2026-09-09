'use client';

import React, { useState, useEffect } from 'react';
import {
  CENTRAL_REPRESENTATIVES,
  AP_REPRESENTATIVES,
  LOK_SABHA_MPS,
  AP_MLAS,
  VILLAGE_CONSTITUENCY_MAP,
  type Representative,
} from '@/lib/representatives';

// ── Reverse-geocode lat/lng → district/city using Nominatim ─────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    // Try city → town → county → state_district in order
    return (
      addr.city || addr.town || addr.county || addr.state_district || 'Unknown'
    );
  } catch {
    return 'Unknown';
  }
}

// ── Match a detected place name to our constituency map ─────────────────────
function matchLocation(place: string): {
  pm: Representative;
  cm: Representative;
  mp: Representative | null;
  mla: Representative | null;
} {
  const pm = CENTRAL_REPRESENTATIVES.find(r => r.role === 'PM')!;
  const cm = AP_REPRESENTATIVES.find(r => r.role === 'CM')!;

  // Try exact match first, then partial
  let key = Object.keys(VILLAGE_CONSTITUENCY_MAP).find(
    k => place.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(place.toLowerCase())
  );

  const mapping = key ? VILLAGE_CONSTITUENCY_MAP[key] : null;
  const mp  = mapping ? LOK_SABHA_MPS.find(m => m.constituency === mapping.mp)  ?? null : null;
  const mla = mapping ? AP_MLAS.find(m => m.constituency === mapping.mla) ?? null : null;

  return { pm, cm, mp, mla };
}

// ── Badge colours per role ───────────────────────────────────────────────────
const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  PM:  { bg: '#fff3e0', color: '#e65100', border: '#ffb74d' },
  CM:  { bg: '#e8f5e9', color: '#2e7d32', border: '#66bb6a' },
  MP:  { bg: '#e3f2fd', color: '#1565c0', border: '#64b5f6' },
  MLA: { bg: '#f3e5f5', color: '#6a1b9a', border: '#ba68c8' },
  MLC: { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' },
};

function RepCard({ rep, detected }: { rep: Representative; detected?: string }) {
  const colors = ROLE_COLORS[rep.role] ?? ROLE_COLORS.MP;
  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '0.9rem',
      borderRadius: '0.75rem',
      border: `1.5px solid ${colors.border}`,
      background: colors.bg,
      marginBottom: '0.75rem',
    }}>
      {rep.photoUrl && (
        <img
          src={rep.photoUrl}
          alt={rep.name}
          style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.border}`, flexShrink: 0 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem',
            borderRadius: 999, background: colors.border, color: colors.color,
            letterSpacing: '0.05em',
          }}>
            {rep.role}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#666' }}>{rep.party}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.97rem', color: '#111', marginTop: '0.25rem' }}>{rep.name}</div>
        {rep.constituency && (
          <div style={{ fontSize: '0.8rem', color: '#555' }}>
            📍 {rep.constituency}
            {detected && <span style={{ color: '#999', marginLeft: 4 }}>({detected})</span>}
          </div>
        )}
        {rep.contact && (
          <div style={{ fontSize: '0.78rem', color: '#444', marginTop: '0.2rem' }}>
            📞 {rep.contact}
          </div>
        )}
        {rep.email && (
          <div style={{ fontSize: '0.78rem', color: '#1565c0' }}>
            ✉️ <a href={`mailto:${rep.email}`} style={{ color: '#1565c0' }}>{rep.email}</a>
          </div>
        )}
        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>Since {rep.since}</div>
      </div>
    </div>
  );
}

// ── Main Panel Component ─────────────────────────────────────────────────────
export interface RepresentativesPanelProps {
  /** Pass userPosition [lat, lng] for auto-detect. Or pass a manual village name. */
  userPosition?: [number, number] | null;
  manualVillage?: string;
}

export default function RepresentativesPanel({ userPosition, manualVillage }: RepresentativesPanelProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tirupati');
  const [detected, setDetected]   = useState<string>('Tirupati');
  const [reps, setReps]           = useState<ReturnType<typeof matchLocation> | null>(() => matchLocation('Tirupati'));
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState(true);

  useEffect(() => {
    if (manualVillage) {
      setDetected(manualVillage);
      setSelectedDistrict(manualVillage);
      setReps(matchLocation(manualVillage));
      return;
    }

    if (userPosition) {
      setLoading(true);
      reverseGeocode(userPosition[0], userPosition[1]).then(place => {
        setDetected(place);
        setSelectedDistrict(place);
        setReps(matchLocation(place));
        setLoading(false);
      });
    }
  }, [userPosition, manualVillage]);

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    setDetected(dist);
    setReps(matchLocation(dist));
  };

  return (
    <section style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.875rem',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', background: 'transparent',
          borderBottom: expanded ? '1px solid var(--border-color)' : 'none',
          flexWrap: 'wrap', gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            🏛️ Your Elected Officials & Administration
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ({detected})
          </span>
        </div>

        {/* Quick District / Constituency Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            📍 Change Region:
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="Tirupati">Tirupati (Chittoor)</option>
            <option value="Vijayawada">Vijayawada (NTR)</option>
            <option value="Visakhapatnam">Visakhapatnam</option>
            <option value="Guntur">Guntur</option>
            <option value="Nellore">Nellore</option>
            <option value="Kurnool">Kurnool</option>
            <option value="Eluru">Eluru</option>
          </select>

          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              padding: '0.2rem 0.5rem',
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '1.1rem 1.25rem' }}>
          {loading && (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              📡 Detecting your GPS location to match local representatives…
            </p>
          )}

          {reps && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              <RepCard rep={reps.pm} />
              <RepCard rep={reps.cm} />
              {reps.mp  && <RepCard rep={reps.mp}  detected={detected} />}
              {reps.mla && <RepCard rep={reps.mla} detected={detected} />}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
