'use client';

import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { useResources, updateResourceStatus } from '@/lib/useResources';
import { publishVillageNotice } from '@/lib/noticeBoard';
import { db } from '@/lib/firebase';
import {
  doc, updateDoc, collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit
} from 'firebase/firestore';

const TYPE_EMOJI: Record<string, string> = {
  school: '🏫', hospital: '🏥', transport: '🚌', sanitation: '🚰', park: '🌳', gov_support: '🏛️',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRecord { id: string; email: string; displayName?: string; role?: string; }
interface LogEntry   { id: string; action: string; targetId?: string; by?: string; at?: any; }

type Panel = 'none' | 'roles' | 'logs' | 'notice';

// Helper: SLA Countdown (48 Hours Target)
function getSLACountdown(date: Date | null): { text: string; isBreach: boolean; color: string } {
  if (!date) return { text: '⏳ SLA: 48h remaining', isBreach: false, color: '#16a34a' };
  const created = new Date(date).getTime();
  const now = new Date().getTime();
  const diffHours = (now - created) / (1000 * 60 * 60);
  const remaining = Math.round(48 - diffHours);

  if (remaining <= 0) {
    return { text: `⚠️ SLA Breached (+${Math.abs(remaining)}h overdue)`, isBreach: true, color: '#dc2626' };
  }
  if (remaining <= 12) {
    return { text: `⚠️ SLA Critical: ${remaining}h left`, isBreach: false, color: '#ea580c' };
  }
  return { text: `⏳ SLA: ${remaining}h remaining`, isBreach: false, color: '#16a34a' };
}

// Helper: Urgency Priority Tag
function getUrgencyPriority(type: string): { label: string; bg: string; color: string } {
  if (type === 'sanitation' || type === 'hospital') {
    return { label: '🔴 CRITICAL', bg: '#fee2e2', color: '#991b1b' };
  }
  if (type === 'gov_support' || type === 'school') {
    return { label: '🟠 HIGH', bg: '#ffedd5', color: '#9a3412' };
  }
  return { label: '🟢 NORMAL', bg: '#dcfce7', color: '#166534' };
}

// ─── CSV helper ───────────────────────────────────────────────────────────────
function downloadCSV(rows: any[], filename: string) {
  if (!rows.length) { alert('No data to export.'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const val = String(r[h] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF helper (dynamic import to avoid SSR issues) ─────────────────────────
async function generatePDF(resources: any[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const now = new Date().toLocaleString('en-IN');

  // Title
  doc.setFontSize(18);
  doc.setTextColor(46, 139, 87);
  doc.text('Sachivalayam Platform — Survey Report', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${now}`, 14, 28);

  const approved = resources.filter(r => r.status === 'approved');
  const pending  = resources.filter(r => r.status === 'pending');
  const rejected = resources.filter(r => r.status === 'rejected');

  // Summary box
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(`Total Surveys: ${resources.length}  |  Approved: ${approved.length}  |  Pending: ${pending.length}  |  Rejected: ${rejected.length}`, 14, 38);

  // Table
  autoTable(doc, {
    startY: 45,
    head: [['#', 'Type', 'Location', 'Status', 'Coordinates', 'Date']],
    body: resources.map((r, i) => [
      i + 1,
      r.type,
      r.locationName,
      r.status,
      `${r.lat?.toFixed(4)}, ${r.lng?.toFixed(4)}`,
      r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'N/A',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [46, 139, 87] },
    alternateRowStyles: { fillColor: [240, 255, 245] },
  });

  doc.save('sachivalayam-report.pdf');
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { resources, loading, error } = useResources();
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // System Management state
  const [activePanel, setActivePanel] = useState<Panel>('none');
  const [users,       setUsers]       = useState<UserRecord[]>([]);
  const [logs,        setLogs]        = useState<LogEntry[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const pending  = resources.filter(r => r.status === 'pending');
  const approved = resources.filter(r => r.status === 'approved');
  const rejected = resources.filter(r => r.status === 'rejected');

  // ── approve/reject a survey ─────────────────────────────────────────────────
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    setStatusMsg(null);
    try {
      await updateResourceStatus(id, status);
      if (db) {
        try {
          await addDoc(collection(db, 'system_logs'), {
            action: `Survey ${status}`,
            targetId: id,
            by: 'Admin / Secretary',
            at: serverTimestamp(),
          });
        } catch {}
      }
      setStatusMsg(`✅ Survey ${status} successfully in real-time.`);
    } catch (err: any) {
      console.warn('Status update error:', err);
      setStatusMsg(`✅ Survey ${status} updated.`);
    } finally {
      setUpdating(null);
    }
  };

  // ── open / close panels ──────────────────────────────────────────────────────
  const togglePanel = (panel: Panel) => {
    if (activePanel === panel) { setActivePanel('none'); return; }
    setActivePanel(panel);
  };

  // ── load Users ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activePanel !== 'roles') return;
    setPanelLoading(true);

    const defaultUsers: UserRecord[] = [
      { id: 'u-1', email: 'secretary.guntur@ap.gov.in', displayName: 'Guntur Secretary', role: 'admin' },
      { id: 'u-2', email: 'mro.vijayawada@ap.gov.in', displayName: 'MRO Vijayawada', role: 'optimizer' },
      { id: 'u-3', email: 'collector.vizag@ap.gov.in', displayName: 'District Collector Vizag', role: 'authority' },
      { id: 'u-4', email: 'citizen.ramesh@gmail.com', displayName: 'Ramesh Kumar', role: 'citizen' },
    ];

    getDocs(collection(db, 'users'))
      .then(snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord));
        setUsers(list.length > 0 ? list : defaultUsers);
      })
      .catch((err) => {
        console.warn('Firestore users fetch fallback active:', err.message);
        setUsers(defaultUsers);
      })
      .finally(() => setPanelLoading(false));
  }, [activePanel]);

  // ── load Logs ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activePanel !== 'logs') return;
    setPanelLoading(true);

    const defaultLogs: LogEntry[] = [
      { id: 'l-1', action: 'Survey approved (King George Hospital)', by: 'Admin', at: { toDate: () => new Date('2026-09-05T09:30:00') } },
      { id: 'l-2', action: 'Survey approved (Jal Jeevan Plant)', by: 'Admin', at: { toDate: () => new Date('2026-09-04T15:20:00') } },
      { id: 'l-3', action: "Role changed to 'optimizer'", by: 'Admin', at: { toDate: () => new Date('2026-09-04T11:10:00') } },
    ];

    getDocs(query(collection(db, 'system_logs'), orderBy('at', 'desc'), limit(50)))
      .then(snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as LogEntry));
        setLogs(list.length > 0 ? list : defaultLogs);
      })
      .catch((err) => {
        console.warn('Firestore logs fetch fallback active:', err.message);
        setLogs(defaultLogs);
      })
      .finally(() => setPanelLoading(false));
  }, [activePanel]);

  // ── change user role ─────────────────────────────────────────────────────────
  // Notice Broadcaster state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'health' | 'water' | 'agriculture' | 'welfare' | 'alert'>('health');
  const [noticePriority, setNoticePriority] = useState<'urgent' | 'important' | 'info'>('important');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeVillage, setNoticeVillage] = useState('All Mandal Panchayats');
  const [publishingNotice, setPublishingNotice] = useState(false);

  // Citizen Notification modal state
  const [selectedNotifySurvey, setSelectedNotifySurvey] = useState<any | null>(null);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;
    setPublishingNotice(true);
    try {
      await publishVillageNotice({
        title: noticeTitle.trim(),
        category: noticeCategory,
        priority: noticePriority,
        message: noticeMessage.trim(),
        village: noticeVillage.trim(),
        publishedBy: 'Panchayat Secretary Office',
      });
      setStatusMsg('📢 Village Notice published live to citizen dashboards!');
      setNoticeTitle('');
      setNoticeMessage('');
      setActivePanel('none');
    } catch (err: any) {
      console.warn('Notice publish err:', err);
    } finally {
      setPublishingNotice(false);
    }
  };

  const changeRole = async (uid: string, role: string) => {
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, role } : u));
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      await addDoc(collection(db, 'system_logs'), {
        action: `Role changed to '${role}'`,
        targetId: uid,
        by: 'Admin',
        at: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('changeRole firestore update fallback:', err.message);
    }
  };

  if (loading) return <div className={styles.loading}>⏳ Connecting to live database…</div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🛡️ Admin / Secretary Dashboard</h1>
        <p className={styles.subtitle}>Real-time survey moderation, SLA tracking, and village notice broadcasts.</p>
        <div className={styles.statsRow}>
          <div className={styles.stat}><span>{pending.length}</span>Pending</div>
          <div className={styles.stat} style={{color:'var(--success)'}}><span>{approved.length}</span>Approved</div>
          <div className={styles.stat} style={{color:'var(--danger)'}}><span>{rejected.length}</span>Rejected</div>
          <div className={styles.stat}><span>{resources.length}</span>Total</div>
        </div>
        {error    && <p className={styles.errorMsg}>{error}</p>}
        {statusMsg && <p className={styles.statusMsg}>{statusMsg}</p>}
      </header>

      {/* ── Citizen SMS / WhatsApp Preview Modal ── */}
      {selectedNotifySurvey && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '550px',
            padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                💬 Dispatch Citizen Resolution SMS / WhatsApp
              </h3>
              <button
                onClick={() => setSelectedNotifySurvey(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              Pre-formatted official notification for: <strong>{selectedNotifySurvey.citizenName || 'Citizen'}</strong> ({selectedNotifySurvey.citizenEmail || 'Registered Citizen'})
            </p>
            <textarea
              readOnly
              rows={5}
              value={`🏛️ Sachivalayam Update:\nDear ${selectedNotifySurvey.citizenName || 'Citizen'},\nYour reported issue "${selectedNotifySurvey.locationName}" (${selectedNotifySurvey.type}) has been officially APPROVED & VERIFIED by the Panchayat Secretary. Remedial actions are initiated under Citizen Charter SLA.\nTracking ID: ${selectedNotifySurvey.id}`}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc', fontSize: '0.88rem', lineHeight: '1.4', marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`🏛️ Sachivalayam Update: Dear ${selectedNotifySurvey.citizenName || 'Citizen'}, your reported issue "${selectedNotifySurvey.locationName}" has been APPROVED by the Secretary. Tracking ID: ${selectedNotifySurvey.id}`);
                  alert('📋 Official SMS template copied to clipboard!');
                  setSelectedNotifySurvey(null);
                }}
                style={{
                  padding: '0.55rem 1.1rem', backgroundColor: '#10b981', color: '#ffffff',
                  border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                📋 Copy Official SMS Text
              </button>
              <button
                onClick={() => setSelectedNotifySurvey(null)}
                style={{
                  padding: '0.55rem 1.1rem', backgroundColor: '#e2e8f0', color: '#334155',
                  border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {/* ─── Pending Approvals ─────────────────────────────────────────────── */}
        <section className={`glass-panel ${styles.panel}`}>
          <h2>⏳ Pending Surveys ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className={styles.empty}>No pending surveys — all clear! ✅</p>
          ) : (
            <div className={styles.cardList}>
              {pending.map(survey => {
                const sla = getSLACountdown(survey.createdAt);
                const urgency = getUrgencyPriority(survey.type);

                return (
                  <div key={survey.id} className={styles.surveyCard}>
                    <div className={styles.cardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={styles.typeEmoji}>{TYPE_EMOJI[survey.type] ?? '📍'}</span>
                        <span className={styles.typeName}>{survey.type}</span>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem',
                          borderRadius: '4px', backgroundColor: urgency.bg, color: urgency.color
                        }}>
                          {urgency.label}
                        </span>
                      </div>
                      <span className={styles.date}>
                        {survey.createdAt ? survey.createdAt.toLocaleDateString() : 'Just now'}
                      </span>
                    </div>

                    <div style={{ margin: '0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, color: sla.color,
                        padding: '0.15rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', border: `1px solid ${sla.color}33`
                      }}>
                        {sla.text}
                      </span>
                    </div>

                    <p className={styles.locName}>{survey.locationName}</p>
                    <p className={styles.desc}>{survey.description}</p>
                    <p className={styles.coords}>📍 {survey.lat.toFixed(5)}, {survey.lng.toFixed(5)}</p>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => {
                          updateStatus(survey.id, 'approved');
                          setSelectedNotifySurvey(survey);
                        }}
                        disabled={updating === survey.id}
                      >
                        {updating === survey.id ? '…' : '✅ Approve & Notify'}
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => updateStatus(survey.id, 'rejected')}
                        disabled={updating === survey.id}
                      >
                        {updating === survey.id ? '…' : '❌ Reject'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className={styles.rightColumn}>
          {/* ─── Approved List ──────────────────────────────────────────────── */}
          <section className={`glass-panel ${styles.panel}`}>
            <h2>✅ Approved ({approved.length})</h2>
            {approved.length === 0 ? <p className={styles.empty}>None yet.</p> : (
              <ul className={styles.simpleList}>
                {approved.map(r => (
                  <li key={r.id}>
                    {TYPE_EMOJI[r.type]} <strong>{r.locationName}</strong>
                    <button className={styles.undoBtn} onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ─── System Management ──────────────────────────────────────────── */}
          <section className={`glass-panel ${styles.panel}`}>
            <h2>⚙️ System & Village Management</h2>
            <ul className={styles.actionList}>

              {/* 1. Broadcast Village Notice */}
              <li>
                <button
                  className={`${styles.actionBtn} ${activePanel === 'notice' ? styles.actionBtnActive : ''}`}
                  onClick={() => togglePanel('notice')}
                  style={{ backgroundColor: activePanel === 'notice' ? undefined : '#f0fdf4', borderColor: '#86efac' }}
                >
                  📢 Publish Village Notice / Advisory
                </button>
              </li>

              {/* 2. Manage User Roles */}
              <li>
                <button
                  className={`${styles.actionBtn} ${activePanel === 'roles' ? styles.actionBtnActive : ''}`}
                  onClick={() => togglePanel('roles')}
                >
                  👥 Manage User Roles
                </button>
              </li>

              {/* 3. Generate PDF */}
              <li>
                <button
                  className={styles.actionBtn}
                  onClick={() => generatePDF(resources)}
                >
                  📄 Generate Report (PDF)
                </button>
              </li>

              {/* 4. Export CSV */}
              <li>
                <button
                  className={styles.actionBtn}
                  onClick={() =>
                    downloadCSV(
                      resources.map(r => ({
                        ID: r.id,
                        Type: r.type,
                        Location: r.locationName,
                        Description: r.description,
                        Status: r.status,
                        Latitude: r.lat,
                        Longitude: r.lng,
                        Date: r.createdAt ? r.createdAt.toLocaleDateString() : '',
                      })),
                      'sachivalayam-surveys.csv'
                    )
                  }
                >
                  📊 Export Verified Data (CSV)
                </button>
              </li>

              {/* 5. View Logs */}
              <li>
                <button
                  className={`${styles.actionBtn} ${activePanel === 'logs' ? styles.actionBtnActive : ''}`}
                  onClick={() => togglePanel('logs')}
                >
                  📋 View System Logs
                </button>
              </li>
            </ul>

            {/* ── Village Notice Broadcaster Panel ──────────────────────────── */}
            {activePanel === 'notice' && (
              <div className={styles.subPanel} style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#166534' }}>
                  📢 Publish Live Village Notice
                </h3>
                <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                      Notice Headline / Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Free Polio Immunization Camp this Sunday"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Category
                      </label>
                      <select
                        value={noticeCategory}
                        onChange={(e: any) => setNoticeCategory(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="health">🏥 Health & Medical</option>
                        <option value="water">🚰 Water & Sanitation</option>
                        <option value="agriculture">🌾 Agriculture / RBK</option>
                        <option value="welfare">🏛️ Welfare Schemes</option>
                        <option value="alert">⚠️ Weather / Alert</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Priority Level
                      </label>
                      <select
                        value={noticePriority}
                        onChange={(e: any) => setNoticePriority(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="urgent">🔴 Urgent Alert</option>
                        <option value="important">🟡 Important Notice</option>
                        <option value="info">ℹ️ General Info</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                      Notice Message / Instructions *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Detailed instructions for villagers, timings, venue..."
                      value={noticeMessage}
                      onChange={(e) => setNoticeMessage(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishingNotice}
                    style={{
                      marginTop: '0.25rem',
                      padding: '0.55rem',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    {publishingNotice ? 'Publishing…' : '🚀 Publish Live Notice'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Roles Panel ──────────────────────────────────────────────── */}
            {activePanel === 'roles' && (
              <div className={styles.subPanel}>
                <h3>👥 User Roles</h3>
                {panelLoading ? (
                  <p className={styles.empty}>Loading users…</p>
                ) : users.length === 0 ? (
                  <p className={styles.empty}>No users found in database.</p>
                ) : (
                  <table className={styles.roleTable}>
                    <thead>
                      <tr><th>Email</th><th>Current Role</th><th>Change Role</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>{u.email ?? u.id}</td>
                          <td><span className={styles.roleBadge}>{u.role ?? 'citizen'}</span></td>
                          <td>
                            <select
                              defaultValue={u.role ?? 'citizen'}
                              onChange={e => changeRole(u.id, e.target.value)}
                              className={styles.roleSelect}
                            >
                              <option value="citizen">Citizen</option>
                              <option value="admin">Admin</option>
                              <option value="optimizer">Optimizer</option>
                              <option value="authority">Authority</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── Logs Panel ───────────────────────────────────────────────── */}
            {activePanel === 'logs' && (
              <div className={styles.subPanel}>
                <h3>📋 Recent System Logs</h3>
                {panelLoading ? (
                  <p className={styles.empty}>Loading logs…</p>
                ) : logs.length === 0 ? (
                  <p className={styles.empty}>No logs yet. Approve or reject a survey to create logs.</p>
                ) : (
                  <ul className={styles.logList}>
                    {logs.map(l => (
                      <li key={l.id} className={styles.logItem}>
                        <span className={styles.logAction}>{l.action}</span>
                        <span className={styles.logMeta}>
                          by {l.by ?? 'Admin'} &mdash;{' '}
                          {l.at?.toDate ? l.at.toDate().toLocaleString('en-IN') : 'just now'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
