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
import { getFundAllocations, FundAllocation } from '@/lib/funds';
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
