'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfile, getSubmissionsByDistrict, saveMonthlyReport, getAllSubmissions, getMonthlyReports, calcPerformanceScore, type UserProfile, type Submission, type MonthlyReport } from '@/lib/userProfile';
import { calculatePerformanceScore, getPerformanceTierEmoji, getPerformanceTierColor, type PerformanceScore } from '@/lib/performanceScoring';
import { getCompleteRepresentativesList } from '@/lib/representativesData';
import { CENTRAL_REPRESENTATIVES, AP_REPRESENTATIVES } from '@/lib/representatives';
import { GOVERNMENT_SCHEMES } from '@/lib/schemes';
import { getFundAllocations, allocateDevelopmentFund, FundAllocation } from '@/lib/funds';
import { useRouter } from 'next/navigation';
import styles from './optimizer.module.css';

const InteractiveMap = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <p>Loading map…</p> });

export default function OptimizerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminReports, setAdminReports] = useState<MonthlyReport[]>([]);
  const [sentReports, setSentReports] = useState<MonthlyReport[]>([]);
  const [fundAllocations, setFundAllocations] = useState<FundAllocation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'villages' | 'submissions' | 'funds' | 'monthly' | 'map'>('overview');
  const [villageFilter, setVillageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fundCategoryFilter, setFundCategoryFilter] = useState('all');
  const [fundStatusFilter, setFundStatusFilter] = useState('all');
  const [showNewGrantForm, setShowNewGrantForm] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqVillage, setReqVillage] = useState('Vijayawada Rural');
  const [reqDistrict, setReqDistrict] = useState('NTR / Krishna');
  const [reqCategory, setReqCategory] = useState<'water' | 'sanitation' | 'education' | 'healthcare' | 'roads' | 'support'>('water');
  const [reqAmount, setReqAmount] = useState('500000');
  const [reqRemarks, setReqRemarks] = useState('');
  const [submittingGrant, setSubmittingGrant] = useState(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState('');
  const [monthlyNote, setMonthlyNote] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async (userUid?: string) => {
    let p: UserProfile | null = null;
    if (userUid) {
      p = await getUserProfile(userUid);
    }
    if (!p && typeof window !== 'undefined') {
      const cached = localStorage.getItem('userProfile');
      if (cached) {
        try { p = JSON.parse(cached); } catch {}
      }
    }
    if (!p) {
      p = {
        uid: userUid || 'opt-default',
        name: 'MRO Vijayawada Mandal',
        age: '45',
        mobile: '9848011223',
        role: 'optimizer',
        village: 'Vijayawada Rural',
        district: 'NTR / Krishna',
        state: 'Andhra Pradesh',
        email: 'mro.vijayawada@ap.gov.in',
      };
    }
    setProfile(p);

    const subs = await getAllSubmissions();
    setSubmissions(subs);
    const aReports = await getMonthlyReports({ role: 'admin' });
    setAdminReports(aReports);
    const sent = await getMonthlyReports({ role: 'optimizer' });
    setSentReports(sent);
    const funds = await getFundAllocations();
    setFundAllocations(funds);
    setLoading(false);
  };

  useEffect(() => {
    loadData(auth.currentUser?.uid);

    const unsub = onAuthStateChanged(auth, async (user) => {
      await loadData(user?.uid);
    });

    const handleDataEvents = () => {
      loadData(auth.currentUser?.uid);
    };

    window.addEventListener('submissions_updated', handleDataEvents);
    window.addEventListener('resources_updated', handleDataEvents);
    window.addEventListener('reports_updated', handleDataEvents);
    window.addEventListener('funds_updated', handleDataEvents);

    return () => {
      unsub();
      window.removeEventListener('submissions_updated', handleDataEvents);
      window.removeEventListener('resources_updated', handleDataEvents);
      window.removeEventListener('reports_updated', handleDataEvents);
      window.removeEventListener('funds_updated', handleDataEvents);
    };
  }, []);

  // Village stats aggregation
  const villageStats = useMemo(() => {
    const map: Record<string, { village: string; total: number; resolved: number; pending: number; inProgress: number; adminName?: string }> = {};
    submissions.forEach(s => {
      if (!map[s.village]) map[s.village] = { village: s.village, total: 0, resolved: 0, pending: 0, inProgress: 0, adminName: s.adminName };
      map[s.village].total++;
      if (s.status === 'resolved') map[s.village].resolved++;
      else if (s.status === 'pending') map[s.village].pending++;
      else map[s.village].inProgress++;
      if (s.adminName && !map[s.village].adminName) map[s.village].adminName = s.adminName;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [submissions]);

  const villages = useMemo(() => [...new Set(submissions.map(s => s.village))].sort(), [submissions]);

  const filtered = useMemo(() => submissions.filter(s => {
    const vMatch = villageFilter === 'all' || s.village === villageFilter;
    const sMatch = statusFilter === 'all' || s.status === statusFilter;
    return vMatch && sMatch;
  }), [submissions, villageFilter, statusFilter]);

  const total = submissions.length;
  const resolved = submissions.filter(s => s.status === 'resolved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const inProgress = submissions.filter(s => s.status === 'in-progress').length;
  const overallRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Scheme gap analysis across all villages
  const schemeGaps: Record<string, number> = {};
  submissions.forEach(s => s.schemesNotReceiving?.forEach(id => { schemeGaps[id] = (schemeGaps[id] || 0) + 1; }));
  const topGaps = Object.entries(schemeGaps).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const mapLocations = submissions.filter(s => s.lat && s.lng).map(s => ({
    id: s.id || `loc-${Math.random()}`,
    type: s.status === 'resolved' ? 'school' : s.status === 'in-progress' ? 'hospital' : 'sanitation',
    lat: s.lat!,
    lng: s.lng!,
    locationName: s.village || 'Village Location',
    description: `${s.citizenName} — ${s.village} (${s.status}): ${s.specificProblem || ''}`
  }));

  const handleProposeGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    setSubmittingGrant(true);
    try {
      await allocateDevelopmentFund({
        projectTitle: reqTitle.trim(),
        village: reqVillage.trim(),
        district: reqDistrict,
        category: reqCategory,
        amountAllocated: Number(reqAmount) || 500000,
        allocatedBy: profile?.name ? `${profile.name} (MRO / MPDO Recommendation)` : 'MRO / MPDO Office',
        status: 'sanctioned',
        remarks: reqRemarks.trim() || 'Recommended by Mandal Revenue Officer (MRO/MPDO) based on village escalation metrics.',
      });
      setGrantSuccessMsg(`✅ Development Grant of ₹${(Number(reqAmount) || 500000).toLocaleString('en-IN')} proposed and registered!`);
      setReqTitle('');
      setReqRemarks('');
      setShowNewGrantForm(false);
      setTimeout(() => setGrantSuccessMsg(''), 5000);
      const updated = await getFundAllocations();
      setFundAllocations(updated);
    } catch (err: any) {
      alert(`Failed to propose grant: ${err.message}`);
    } finally {
      setSubmittingGrant(false);
    }
  };

  const filteredFunds = useMemo(() => {
    return fundAllocations.filter(f => {
      const catMatch = fundCategoryFilter === 'all' || f.category === fundCategoryFilter;
      const statusMatch = fundStatusFilter === 'all' || f.status === fundStatusFilter;
      return catMatch && statusMatch;
    });
  }, [fundAllocations, fundCategoryFilter, fundStatusFilter]);

  const totalFundAmount = useMemo(() => {
    return fundAllocations.reduce((sum, f) => sum + (f.amountAllocated || 0), 0);
  }, [fundAllocations]);

  const handleSendToAuthority = async () => {
    if (!profile) return;
    setSendingReport(true);
    try {
      await saveMonthlyReport({
        reporterRole: 'optimizer',
        reporterId: profile.uid || auth.currentUser?.uid || 'opt-default',
        reporterName: profile.name || 'MRO Optimizer',
        district: profile.district || 'NTR / Krishna',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalSubmissions: total,
        resolved, pending, inProgress, resolutionRate: overallRate,
        flaggedIssues: villageStats.filter(v => calcPerformanceScore(v.resolved, v.total, 48).score < 50)
          .map(v => `${v.village} (${v.total > 0 ? Math.round((v.resolved / v.total) * 100) : 0}% resolved)`)
          .join('; ') || 'All mandal villages meeting SLA standards',
        summaryNote: monthlyNote.trim() || `Monthly mandal performance report: ${resolved}/${total} issues resolved (${overallRate}% resolution rate).`,
        sentToOptimizer: true,
        sentToAuthority: true,
      });
      const sent = await getMonthlyReports({ role: 'optimizer' });
      setSentReports(sent);
      setMonthlyNote('');
      alert('✅ Monthly summary successfully transmitted to Higher Authority!');
    } catch (err: any) {
      alert(`Failed to send report: ${err.message}`);
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) return <div className={styles.loadingScreen}><div className={styles.spinner} /><p>Loading Optimizer Portal…</p></div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span>🔭</span>
          <div>
            <h1 className={styles.headerTitle}>MRO/MPDO — Optimizer Portal</h1>
            <p className={styles.headerSub}>{profile?.district} District · Monitoring {villageStats.length} Villages</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userName}>🔭 {profile?.name}</span>
          <button className={styles.logoutBtn} onClick={async () => { await signOut(auth); localStorage.removeItem('userProfile'); router.push('/auth'); }}>Logout</button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}><span className={styles.statNum}>{villageStats.length}</span><span className={styles.statLabel}>Villages Monitored</span></div>
        <div className={styles.statCard}><span className={styles.statNum}>{total}</span><span className={styles.statLabel}>Total Reports</span></div>
        <div className={`${styles.statCard} ${styles.statPending}`}><span className={styles.statNum}>{pending}</span><span className={styles.statLabel}>🟡 Pending</span></div>
        <div className={`${styles.statCard} ${styles.statResolved}`}><span className={styles.statNum}>{resolved}</span><span className={styles.statLabel}>✅ Resolved</span></div>
        <div className={styles.statCard}><span className={styles.statNum} style={{ color: overallRate >= 70 ? '#6ee7b7' : overallRate >= 40 ? '#fcd34d' : '#fca5a5' }}>{overallRate}%</span><span className={styles.statLabel}>Overall Resolution</span></div>
        <div className={styles.statCard}><span className={styles.statNum} style={{ color: '#fca5a5' }}>{villageStats.filter(v => v.total > 0 && (v.resolved / v.total) < 0.5).length}</span><span className={styles.statLabel}>🔴 Flagged Villages</span></div>
      </div>

      <nav className={styles.tabNav}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'villages', label: '🏘️ Village Performance' },
          { key: 'submissions', label: `📋 All Reports (${total})` },
          { key: 'funds', label: `💰 Grants & Funds (${fundAllocations.length})` },
          { key: 'monthly', label: '📨 Send to Authority' },
          { key: 'map', label: '🗺️ Map View' },
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
            {/* Scheme Gaps */}
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>🚨 Top Scheme Gaps (All Villages)</h2>
              <p className={styles.panelSub}>Schemes most frequently NOT received across all submissions.</p>
              {topGaps.length === 0 ? (
                <p className={styles.empty}>No scheme data yet.</p>
              ) : (
                <div className={styles.gapList}>
                  {topGaps.map(([id, count]) => {
                    const scheme = GOVERNMENT_SCHEMES.find(s => s.id === id);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={id} className={styles.gapItem}>
                        <div className={styles.gapTop}>
                          <span className={styles.gapName}>{scheme?.name || id}</span>
                          <span className={styles.gapCount}>{count} unserved ({pct}%)</span>
                        </div>
                        <div className={styles.gapBar}><div className={styles.gapFill} style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Admin Reports received */}
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>📬 Admin Monthly Reports Received</h2>
              <p className={styles.panelSub}>Reports sent by Secretaries to you this month.</p>
              {adminReports.length === 0 ? (
                <p className={styles.empty}>No reports received from admins yet.</p>
              ) : (
                <div className={styles.reportsList}>
                  {adminReports.slice(0, 6).map(r => {
                    const perf = calcPerformanceScore(r.resolved, r.totalSubmissions, 48);
                    return (
                      <div key={r.id} className={styles.reportCard}>
                        <div className={styles.reportCardHead}>
                          <div>
                            <strong className={styles.reportVillage}>{r.village}</strong>
                            <span className={styles.reportAdmin}>Secretary: {r.reporterName}</span>
                          </div>
                          <span className={styles.perfTag} style={{ background: `${perf.color}22`, color: perf.color, border: `1px solid ${perf.color}55` }}>
                            {perf.score}% — {perf.label}
                          </span>
                        </div>
                        <div className={styles.reportMini}>
                          <span>Total: {r.totalSubmissions}</span>
                          <span>Resolved: {r.resolved}</span>
                          <span>Pending: {r.pending}</span>
                          <span>{r.month}</span>
                        </div>
                        {r.summaryNote && <p className={styles.reportNote}>"{r.summaryNote}"</p>}
                        {r.flaggedIssues && <p className={styles.flaggedText}>⚠️ Issues: {r.flaggedIssues}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Representatives */}
            <section className={styles.panel} style={{ gridColumn: '1 / -1' }}>
              <h2 className={styles.panelTitle}>🗳️ Current Elected Representatives</h2>
              <div className={styles.repsRow}>
                {[...CENTRAL_REPRESENTATIVES, ...AP_REPRESENTATIVES].map(rep => (
                  <div key={rep.name} className={styles.repCard}>
                    {rep.photoUrl && <img src={rep.photoUrl} alt={rep.name} className={styles.repPhoto} />}
                    <div className={styles.repInfo}>
                      <span className={styles.repRole}>{rep.role === 'PM' ? '🇮🇳 Prime Minister' : '🏛️ Chief Minister (AP)'}</span>
                      <strong className={styles.repName}>{rep.name}</strong>
                      <span className={styles.repParty}>{rep.party}</span>
                      {rep.contact && <a href={`tel:${rep.contact}`} className={styles.repContact}>📞 {rep.contact}</a>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── VILLAGES ── */}
        {activeTab === 'villages' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Village-wise Admin Performance</h2>
            <div className={styles.villageTable}>
              <div className={styles.tableHead}>
                <span>Village</span>
                <span>Secretary</span>
                <span>Total</span>
                <span>Resolved</span>
                <span>Pending</span>
                <span>Rate</span>
                <span>Score</span>
                <span>Status</span>
              </div>
              {villageStats.map(vs => {
                const perf = calcPerformanceScore(vs.resolved, vs.total, 48);
                const rate = vs.total > 0 ? Math.round((vs.resolved / vs.total) * 100) : 0;
                return (
                  <div key={vs.village} className={`${styles.tableRow} ${perf.score < 50 ? styles.flagged : ''}`}>
                    <span className={styles.villageCell}>{vs.village}</span>
                    <span>{vs.adminName || '—'}</span>
                    <span>{vs.total}</span>
                    <span style={{ color: '#6ee7b7' }}>{vs.resolved}</span>
                    <span style={{ color: vs.pending > 5 ? '#fca5a5' : '#fcd34d' }}>{vs.pending}</span>
                    <span>{rate}%</span>
                    <span style={{ color: perf.color, fontWeight: 700 }}>{perf.score}</span>
                    <span className={styles.perfLabel} style={{ background: `${perf.color}22`, color: perf.color, border: `1px solid ${perf.color}44` }}>
                      {perf.score < 50 ? '🔴 ' : '🟢 '}{perf.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {villageStats.filter(v => calcPerformanceScore(v.resolved, v.total, 48).score < 50).length > 0 && (
              <div className={styles.flagAlert}>
                ⚠️ <strong>{villageStats.filter(v => calcPerformanceScore(v.resolved, v.total, 48).score < 50).length}</strong> villages are flagged for low performance. These will be highlighted in your monthly report to Higher Authorities.
              </div>
            )}
          </section>
        )}

        {/* ── ALL REPORTS ── */}
        {activeTab === 'submissions' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>All Citizen Reports</h2>
            <div className={styles.filterBar}>
              <select value={villageFilter} onChange={e => setVillageFilter(e.target.value)}>
                <option value="all">All Villages</option>
                {villages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <span className={styles.filterCount}>{filtered.length} reports</span>
            </div>
            <div className={styles.allReportsList}>
              {filtered.map(sub => (
                <div key={sub.id} className={`${styles.subCard} ${styles[sub.status]}`}>
                  <div className={styles.subHead}>
                    <div>
                      <strong className={styles.subName}>{sub.citizenName}</strong>
                      <span className={styles.subMeta}>Age: {sub.age} · 📞 {sub.mobile} · 📍 {sub.village}</span>
                    </div>
                    <span className={`${styles.statusTag} ${styles[sub.status]}`}>
                      {sub.status === 'pending' ? '🟡 Pending' : sub.status === 'in-progress' ? '🔵 In Progress' : '✅ Resolved'}
                    </span>
                  </div>
                  {sub.specificProblem && <p className={styles.subProblem}>{sub.specificProblem}</p>}
                  {sub.schemesNotReceiving?.length > 0 && (
                    <p className={styles.subSchemes}>❌ Not receiving: {sub.schemesNotReceiving.map(id => GOVERNMENT_SCHEMES.find(s => s.id === id)?.name || id).join(', ')}</p>
                  )}
                  {sub.adminResponse && (
                    <div className={styles.adminResp}>
                      <strong>🧑‍💼 Secretary Response:</strong> {sub.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── GRANTS & FUNDS ── */}
        {activeTab === 'funds' && (
          <section className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <h2 className={styles.panelTitle}>💰 Mandal & Village Development Grants</h2>
                <p className={styles.panelSub} style={{ margin: 0 }}>Monitor sanctioned infrastructure allocations and recommend new accelerated development grants.</p>
              </div>
              <button
                onClick={() => setShowNewGrantForm(!showNewGrantForm)}
                style={{
                  padding: '0.6rem 1.2rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
              >
                {showNewGrantForm ? '✕ Close Form' : '➕ Propose New Grant'}
              </button>
            </div>

            {/* Fund Summary Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '0.875rem',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              margin: '1rem 0 1.5rem 0'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Projects</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{fundAllocations.length} Active</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Value Sanctioned</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6ee7b7' }}>₹{totalFundAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Completed Projects</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                  {fundAllocations.filter(f => f.status === 'completed').length}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>In Progress / Sanctioned</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fcd34d' }}>
                  {fundAllocations.filter(f => f.status !== 'completed').length}
                </div>
              </div>
            </div>

            {grantSuccessMsg && (
              <div style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                borderRadius: '0.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                {grantSuccessMsg}
              </div>
            )}

            {/* Propose Grant Form */}
            {showNewGrantForm && (
              <form onSubmit={handleProposeGrant} style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '0.875rem',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.75rem'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#60a5fa', fontWeight: 700 }}>
                  📝 Propose Special Infrastructure Grant (Mandal Recommendation)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Project Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Village Desilting & Flood Embankment"
                      value={reqTitle}
                      onChange={e => setReqTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Target Village *</label>
                    <input
                      type="text"
                      placeholder="e.g. Gollapudi / Penamaluru"
                      value={reqVillage}
                      onChange={e => setReqVillage(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Category</label>
                    <select
                      value={reqCategory}
                      onChange={e => setReqCategory(e.target.value as any)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#1e293b', color: '#fff' }}
                    >
                      <option value="water">💧 Water & Drinking</option>
                      <option value="sanitation">🧹 Sanitation & Waste</option>
                      <option value="healthcare">🏥 Healthcare & Clinics</option>
                      <option value="education">🎓 Education & Anganwadis</option>
                      <option value="roads">🛣️ Roads & CC Pavements</option>
                      <option value="support">⚡ Energy & Livelihood</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Recommended Amount (₹ INR) *</label>
                    <input
                      type="number"
                      step="25000"
                      value={reqAmount}
                      onChange={e => setReqAmount(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Mandal Justification / Ground Assessment</label>
                  <textarea
                    rows={2}
                    placeholder="Urgent requirement identified during village inspection to prevent waterlogging and disease outbreak..."
                    value={reqRemarks}
                    onChange={e => setReqRemarks(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingGrant}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '0.7rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                  }}
                >
                  {submittingGrant ? 'Submitting...' : '🚀 Submit Grant Recommendation'}
                </button>
              </form>
            )}

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <select value={fundCategoryFilter} onChange={e => setFundCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="water">💧 Water</option>
                <option value="sanitation">🧹 Sanitation</option>
                <option value="healthcare">🏥 Healthcare</option>
                <option value="education">🎓 Education</option>
                <option value="roads">🛣️ Roads</option>
                <option value="support">⚡ Energy & Support</option>
              </select>
              <select value={fundStatusFilter} onChange={e => setFundStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="sanctioned">🟡 Sanctioned</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
              <span className={styles.filterCount}>{filteredFunds.length} Allocations</span>
            </div>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredFunds.map(f => {
                const categoryIcon = f.category === 'water' ? '💧' : f.category === 'sanitation' ? '🧹' : f.category === 'healthcare' ? '🏥' : f.category === 'education' ? '🎓' : f.category === 'roads' ? '🛣️' : '⚡';
                const statusColor = f.status === 'completed' ? '#10b981' : f.status === 'in-progress' ? '#3b82f6' : '#f59e0b';
                const statusBg = f.status === 'completed' ? 'rgba(16,185,129,0.15)' : f.status === 'in-progress' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)';
                const statusLabel = f.status === 'completed' ? '✅ Completed' : f.status === 'in-progress' ? '🔵 In Progress' : '🟡 Sanctioned';

                return (
                  <div key={f.id} style={{
                    padding: '1.25rem',
                    borderRadius: '0.875rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.875rem',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: '#cbd5e1',
                          textTransform: 'uppercase'
                        }}>
                          {categoryIcon} {f.category}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          backgroundColor: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusColor}44`
                        }}>
                          {statusLabel}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800 }}>
                        {f.projectTitle}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                        📍 {f.village} · {f.district}
                      </div>

                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          Sanctioned Amount
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#6ee7b7' }}>
                          ₹{f.amountAllocated.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          🏛️ Authority: <strong style={{ color: '#cbd5e1' }}>{f.allocatedBy}</strong>
                        </div>
                      </div>

                      {f.remarks && (
                        <p style={{ margin: 0, fontSize: '0.825rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                          ℹ️ {f.remarks}
                        </p>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '0.6rem'
                    }}>
                      <span>ID: #{f.id}</span>
                      <span>📅 {new Date(f.sanctionedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── MONTHLY → AUTHORITY ── */}
        {activeTab === 'monthly' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>📨 Send Monthly Report to Higher Authority</h2>
            <p className={styles.panelSub}>Compile all village performance data and send your monthly summary to CM/PM office and Higher Authorities.</p>

            <div className={styles.monthlyGrid}>
              <div className={styles.monthlyStat}><span>{total}</span><label>Total Reports</label></div>
              <div className={styles.monthlyStat}><span style={{ color: '#6ee7b7' }}>{resolved}</span><label>Resolved</label></div>
              <div className={styles.monthlyStat}><span style={{ color: '#fcd34d' }}>{pending}</span><label>Pending</label></div>
              <div className={styles.monthlyStat}><span>{overallRate}%</span><label>Overall Rate</label></div>
              <div className={styles.monthlyStat}><span style={{ color: '#fca5a5' }}>{villageStats.filter(v => calcPerformanceScore(v.resolved, v.total, 48).score < 50).length}</span><label>Flagged Villages</label></div>
              <div className={styles.monthlyStat}><span>{adminReports.length}</span><label>Admin Reports Received</label></div>
            </div>

            <div className={styles.formGroup}>
              <label>Summary Note to Higher Authority</label>
              <textarea
                rows={5}
                value={monthlyNote}
                onChange={e => setMonthlyNote(e.target.value)}
                placeholder="Write your summary: overall district performance, key issues, flagged villages, actions taken, recommendations…"
              />
            </div>

            <button className={styles.sendBtn} onClick={handleSendToAuthority} disabled={sendingReport}>
              {sendingReport ? 'Sending…' : '🚀 Send Monthly Report to Higher Authority'}
            </button>

            {sentReports.length > 0 && (
              <>
                <h3 className={styles.subTitle}>Previously Sent to Higher Authority</h3>
                {sentReports.map(r => (
                  <div key={r.id} className={styles.sentCard}>
                    <div className={styles.sentHead}><strong>{r.month}</strong><span className={styles.sentBadge}>✅ Sent to Authority</span></div>
                    <div className={styles.sentStats}><span>Total: {r.totalSubmissions}</span><span>Resolved: {r.resolved}</span><span>Rate: {r.resolutionRate}%</span></div>
                    {r.flaggedIssues && <p className={styles.flaggedText}>⚠️ Flagged: {r.flaggedIssues}</p>}
                    {r.summaryNote && <p className={styles.sentNote}>"{r.summaryNote}"</p>}
                  </div>
                ))}
              </>
            )}
          </section>
        )}

        {/* ── MAP ── */}
        {activeTab === 'map' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>🗺️ All Submission Locations</h2>
            <p className={styles.panelSub}>Real-time map of all citizen report locations across all villages.</p>
            <div className={styles.mapWrap}>
              <InteractiveMap locations={mapLocations} center={[16.5, 80.6]} />
            </div>
            <div className={styles.mapLegend}>
              <span className={styles.legendItem} style={{ color: '#fcd34d' }}>🟡 Pending</span>
              <span className={styles.legendItem} style={{ color: '#93c5fd' }}>🔵 In Progress</span>
              <span className={styles.legendItem} style={{ color: '#6ee7b7' }}>✅ Resolved</span>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
