'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  getUserProfile, getAllSubmissions, getMonthlyReports, calcPerformanceScore,
  type UserProfile, type Submission, type MonthlyReport
} from '@/lib/userProfile';
import { GOVERNMENT_SCHEMES } from '@/lib/schemes';
import { useRouter } from 'next/navigation';
import styles from './authority.module.css';

const InteractiveMap = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <p>Loading state map…</p> });

export default function AuthorityDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [optimizerReports, setOptimizerReports] = useState<MonthlyReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'reports' | 'schemes' | 'map'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/auth'); return; }
      const p = await getUserProfile(user.uid);
      if (!p || p.role !== 'authority') { router.push('/auth'); return; }
      setProfile(p);
      const subs = await getAllSubmissions();
      setSubmissions(subs);
      // Fetch only reports sent to authority (from optimizers)
      const reports = await getMonthlyReports({ role: 'optimizer' });
      setOptimizerReports(reports.filter(r => r.sentToAuthority));
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Aggregation for State/National Level
  const total = submissions.length;
  const resolved = submissions.filter(s => s.status === 'resolved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const inProgress = submissions.filter(s => s.status === 'in-progress').length;
  const overallRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const statePerf = calcPerformanceScore(resolved, total, 48);

  const districtStats = useMemo(() => {
    const map: Record<string, { district: string; total: number; resolved: number; pending: number }> = {};
    submissions.forEach(s => {
      const d = s.district || 'Unassigned';
      if (!map[d]) map[d] = { district: d, total: 0, resolved: 0, pending: 0 };
      map[d].total++;
      if (s.status === 'resolved') map[d].resolved++;
      else if (s.status === 'pending') map[d].pending++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [submissions]);

  const schemeGaps = useMemo(() => {
    const gaps: Record<string, number> = {};
    submissions.forEach(s => s.schemesNotReceiving?.forEach(id => { gaps[id] = (gaps[id] || 0) + 1; }));
    return Object.entries(gaps).sort((a, b) => b[1] - a[1]);
  }, [submissions]);

  const mapLocations = submissions.filter(s => s.lat && s.lng).map(s => ({
    id: s.id!, type: s.status, lat: s.lat!, lng: s.lng!,
    description: `${s.village}, ${s.district} (${s.status})`
  }));

  if (loading) return <div className={styles.loadingScreen}><div className={styles.spinner} /><p>Loading Authority Portal…</p></div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span>🏛️</span>
          <div>
            <h1 className={styles.headerTitle}>Higher Authority Oversight Dashboard</h1>
            <p className={styles.headerSub}>State / Central Level Monitoring</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.statePerfBadge} style={{ background: `${statePerf.color}22`, color: statePerf.color, border: `1px solid ${statePerf.color}55` }}>
            Overall State Score: {statePerf.score}%
          </span>
          <span className={styles.userName}>👤 {profile?.name} (Authority)</span>
          <button className={styles.logoutBtn} onClick={async () => { await signOut(auth); localStorage.removeItem('userProfile'); router.push('/auth'); }}>Logout</button>
        </div>
      </header>

      <div className={styles.statRow}>
        <div className={styles.statCard}><span className={styles.statNum}>{total}</span><span className={styles.statLabel}>Total State Reports</span></div>
        <div className={`${styles.statCard} ${styles.statResolved}`}><span className={styles.statNum}>{resolved}</span><span className={styles.statLabel}>✅ Total Resolved</span></div>
        <div className={`${styles.statCard} ${styles.statPending}`}><span className={styles.statNum}>{pending}</span><span className={styles.statLabel}>🟡 Total Pending</span></div>
        <div className={styles.statCard}><span className={styles.statNum} style={{ color: overallRate >= 70 ? '#6ee7b7' : '#fcd34d' }}>{overallRate}%</span><span className={styles.statLabel}>State Resolution Rate</span></div>
        <div className={styles.statCard}><span className={styles.statNum} style={{ color: '#fca5a5' }}>{districtStats.filter(d => (d.resolved / d.total) < 0.5).length}</span><span className={styles.statLabel}>🔴 Low Performing Districts</span></div>
      </div>

      <nav className={styles.tabNav}>
        {[
          { key: 'overview', label: '📈 Executive Summary' },
          { key: 'districts', label: '🗺️ District Performance' },
          { key: 'schemes', label: '📋 Policy & Scheme Gaps' },
          { key: 'reports', label: '📨 MRO Reports (Direct)' },
          { key: 'map', label: '📍 State Heatmap' },
        ].map(tab => (
          <button key={tab.key} className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key as typeof activeTab)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Critical District Flags</h2>
              <p className={styles.panelSub}>Districts performing below 50% resolution rate.</p>
              <div className={styles.flagList}>
                {districtStats.filter(d => (d.resolved / d.total) < 0.5).length === 0 ? (
                  <div className={styles.empty}>All districts are maintaining standard resolution rates.</div>
                ) : (
                  districtStats.filter(d => (d.resolved / d.total) < 0.5).map(d => {
                    const rate = Math.round((d.resolved / d.total) * 100);
                    return (
                      <div key={d.district} className={styles.flagCard}>
                        <div className={styles.flagHead}>
                          <span className={styles.flagDist}>📍 {d.district}</span>
                          <span className={styles.flagRate}>{rate}% Resolved</span>
                        </div>
                        <div className={styles.flagBody}>Total: {d.total} | Pending: {d.pending}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Top National/State Policy Gaps</h2>
              <p className={styles.panelSub}>Most unfulfilled schemes statewide.</p>
              <div className={styles.gapList}>
                {schemeGaps.slice(0, 5).map(([id, count]) => {
                  const scheme = GOVERNMENT_SCHEMES.find(s => s.id === id);
                  return (
                    <div key={id} className={styles.gapItem}>
                      <div className={styles.gapTop}>
                        <strong>{scheme?.name || id}</strong>
                        <span className={styles.gapCount}>{count} missing</span>
                      </div>
                      <div className={styles.gapBar}><div className={styles.gapFill} style={{ width: `${Math.min(100, (count / total) * 100)}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ── DISTRICTS ── */}
        {activeTab === 'districts' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>District Performance Table</h2>
            <div className={styles.districtTable}>
              <div className={styles.tableHead}>
                <span>District</span>
                <span>Total Reports</span>
                <span>Resolved</span>
                <span>Pending</span>
                <span>Resolution Rate</span>
                <span>Performance Indicator</span>
              </div>
              {districtStats.map(d => {
                const rate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
                const perf = calcPerformanceScore(d.resolved, d.total, 48);
                return (
                  <div key={d.district} className={styles.tableRow}>
                    <span className={styles.dName}>{d.district}</span>
                    <span>{d.total}</span>
                    <span style={{ color: '#6ee7b7' }}>{d.resolved}</span>
                    <span style={{ color: '#fca5a5' }}>{d.pending}</span>
                    <span>{rate}%</span>
                    <span className={styles.perfLabel} style={{ background: `${perf.color}22`, color: perf.color }}>
                      {perf.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── SCHEMES POLICY ── */}
        {activeTab === 'schemes' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Scheme Fulfillment Analysis</h2>
            <p className={styles.panelSub}>Review which schemes are failing to reach citizens at the grassroots level.</p>
            <div className={styles.policyGrid}>
              {schemeGaps.map(([id, count]) => {
                const scheme = GOVERNMENT_SCHEMES.find(s => s.id === id);
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                return (
                  <div key={id} className={styles.policyCard}>
                    <div className={styles.policyHead}>
                      <span className={styles.policyLevel}>{scheme?.level === 'Central' ? '🇮🇳 Central' : '📍 State'}</span>
                      <strong className={styles.policyName}>{scheme?.name || id}</strong>
                    </div>
                    <div className={styles.policyStats}>
                      <div className={styles.pStat}><span>{count}</span><label>Citizens Lacking</label></div>
                      <div className={styles.pStat}><span>{pct}%</span><label>Of All Reports</label></div>
                    </div>
                    <p className={styles.policyElig}>{scheme?.eligibility}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── MRO REPORTS ── */}
        {activeTab === 'reports' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Monthly Reports from MROs (Optimizers)</h2>
            <p className={styles.panelSub}>Direct escalations and monthly summaries from district optimizers.</p>
            <div className={styles.optimizerReports}>
              {optimizerReports.length === 0 ? (
                <div className={styles.empty}>No monthly reports submitted by Optimizers yet.</div>
              ) : (
                optimizerReports.map(r => (
                  <div key={r.id} className={styles.oReportCard}>
                    <div className={styles.oReportHead}>
                      <div>
                        <strong className={styles.oDistrict}>{r.district} District</strong>
                        <span className={styles.oMro}>MRO: {r.reporterName}</span>
                      </div>
                      <span className={styles.oMonth}>{r.month}</span>
                    </div>
                    <div className={styles.oStats}>
                      <span>Total: {r.totalSubmissions}</span>
                      <span style={{ color: '#6ee7b7' }}>Resolved: {r.resolved}</span>
                      <span>Rate: {r.resolutionRate}%</span>
                    </div>
                    <div className={styles.oNote}>
                      <strong>MRO Summary:</strong>
                      <p>{r.summaryNote || 'No additional summary provided.'}</p>
                    </div>
                    {r.flaggedIssues && (
                      <div className={styles.oFlags}>
                        <strong>🔴 Flagged Villages:</strong>
                        <p>{r.flaggedIssues}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── MAP ── */}
        {activeTab === 'map' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Statewide Problem Heatmap</h2>
            <p className={styles.panelSub}>Geographical distribution of all pending and resolved issues.</p>
            <div className={styles.mapWrap}>
              <InteractiveMap locations={mapLocations} center={[16.5, 80.6]} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
