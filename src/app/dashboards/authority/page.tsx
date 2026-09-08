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
import { getFundAllocations, allocateDevelopmentFund, FundAllocation } from '@/lib/funds';
import { useRouter } from 'next/navigation';
import styles from './authority.module.css';

const InteractiveMap = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <p>Loading state map…</p> });

export default function AuthorityDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [optimizerReports, setOptimizerReports] = useState<MonthlyReport[]>([]);
  const [funds, setFunds] = useState<FundAllocation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'schemes' | 'grants' | 'reports' | 'map'>('overview');
  const [loading, setLoading] = useState(true);

  // New grant sanction form state
  const [grantProject, setGrantProject] = useState('');
  const [grantVillage, setGrantVillage] = useState('');
  const [grantDistrict, setGrantDistrict] = useState('Guntur');
  const [grantCategory, setGrantCategory] = useState<'water' | 'sanitation' | 'education' | 'healthcare' | 'roads' | 'support'>('water');
  const [grantAmount, setGrantAmount] = useState('500000');
  const [grantRemarks, setGrantRemarks] = useState('');
  const [sanctioning, setSanctioning] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState('');

  const loadFunds = async () => {
    const list = await getFundAllocations();
    setFunds(list);
  };

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
      await loadFunds();
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
    id: s.id!,
    type: s.status,
    lat: s.lat!,
    lng: s.lng!,
    locationName: `${s.village}, ${s.district}`,
    description: `${s.village}, ${s.district} (${s.status})`
  }));

  const totalSanctioned = funds.reduce((acc, curr) => acc + (curr.amountAllocated || 0), 0);
  const stateBudgetPool = 5000000;
  const remainingBudget = Math.max(0, stateBudgetPool - totalSanctioned);

  const handleSanctionGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantProject.trim() || !grantVillage.trim()) return;
    setSanctioning(true);
    setGrantSuccess('');

    try {
      await allocateDevelopmentFund({
        projectTitle: grantProject.trim(),
        village: grantVillage.trim(),
        district: grantDistrict.trim(),
        category: grantCategory,
        amountAllocated: Number(grantAmount) || 500000,
        allocatedBy: profile?.name ? `${profile.name} (Higher Authority)` : 'State Authority Office',
        status: 'sanctioned',
        remarks: grantRemarks.trim() || 'Sanctioned under Special Accelerated Village Grant.',
      });

      await loadFunds();
      setGrantSuccess('✅ Development Grant officially SANCTIONED and ledger updated!');
      setGrantProject('');
      setGrantVillage('');
      setGrantRemarks('');
    } catch (err: any) {
      console.warn('Grant sanction error:', err);
    } finally {
      setSanctioning(false);
    }
  };

  if (loading) return <div className={styles.loadingScreen}><div className={styles.spinner} /><p>Loading Authority Portal…</p></div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span>🏛️</span>
          <div>
            <h1 className={styles.headerTitle}>Higher Authority Oversight Dashboard</h1>
            <p className={styles.headerSub}>State / Central Level Monitoring & Development Grant Allocations</p>
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
          { key: 'grants', label: `💰 Grants & Fund Sanctions (${funds.length})` },
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

        {/* ── DEVELOPMENT GRANTS & BUDGET LEDGER ── */}
        {activeTab === 'grants' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>💰 Special Development Grant Allocator & State Ledger</h2>
            <p className={styles.panelSub}>Sanction accelerated project funds for critical village infrastructure deficits.</p>

            {/* State Budget Pool Status Bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', margin: '1rem 0'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Discretionary Fund</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>₹{stateBudgetPool.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Sanctioned</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6ee7b7' }}>₹{totalSanctioned.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Remaining Available Pool</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>₹{remainingBudget.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {grantSuccess && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#10b98122', border: '1px solid #10b981', color: '#6ee7b7', borderRadius: '8px', marginBottom: '1rem' }}>
                {grantSuccess}
              </div>
            )}

            {/* Grant Allocation Form */}
            <form onSubmit={handleSanctionGrant} style={{
              padding: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#6ee7b7' }}>➕ Sanction New Special Grant</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>Project Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Solar RO Drinking Water Plant Installation"
                    value={grantProject}
                    onChange={e => setGrantProject(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>Target Village / Ward *</label>
                  <input
                    type="text"
                    placeholder="e.g. Guntur Rural / Mangalagiri Ward 4"
                    value={grantVillage}
                    onChange={e => setGrantVillage(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>District</label>
                  <select
                    value={grantDistrict}
                    onChange={e => setGrantDistrict(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: '#1e293b', color: '#fff' }}
                  >
                    <option value="Guntur">Guntur</option>
                    <option value="NTR / Krishna">NTR / Krishna</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Tirupati">Tirupati</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Anantapur">Anantapur</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>Grant Amount (₹ INR) *</label>
                  <input
                    type="number"
                    step="50000"
                    value={grantAmount}
                    onChange={e => setGrantAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>Official Sanction Remarks & Justification</label>
                <textarea
                  rows={2}
                  placeholder="Approved under Special Accelerated Village Grant. Covers RO purification and local distribution..."
                  value={grantRemarks}
                  onChange={e => setGrantRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                disabled={sanctioning}
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.6rem 1.4rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {sanctioning ? 'Sanctioning...' : '🏛️ Authorize & Sanction Development Grant'}
              </button>
            </form>

            {/* List of Sanctioned Grants */}
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#f8fafc' }}>📜 Active Sanctioned Grants Ledger</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {funds.map(f => (
                <div key={f.id} style={{
                  padding: '1rem', borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex', flexDirection: 'column', gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#10b98122', color: '#6ee7b7' }}>
                      {f.category.toUpperCase()}
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: '#6ee7b7' }}>₹{f.amountAllocated.toLocaleString('en-IN')}</strong>
                  </div>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{f.projectTitle}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>📍 {f.village}, {f.district}</div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>{f.remarks}</p>
                </div>
              ))}
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
