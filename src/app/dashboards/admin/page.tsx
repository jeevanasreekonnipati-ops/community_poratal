'use client';

import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { useResources } from '@/lib/useResources';
import { db } from '@/lib/firebase';
import {
  doc, updateDoc, collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit
} from 'firebase/firestore';

const TYPE_EMOJI: Record<string, string> = {
  school: '🏫', hospital: '🏥', transport: '🚌', sanitation: '🚰', park: '🌳',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRecord { id: string; email: string; displayName?: string; role?: string; }
interface LogEntry   { id: string; action: string; targetId?: string; by?: string; at?: any; }

type Panel = 'none' | 'roles' | 'logs';

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
      if (db) {
        await updateDoc(doc(db, 'resources', id), { status });
        await addDoc(collection(db, 'system_logs'), {
          action: `Survey ${status}`,
          targetId: id,
          by: 'Admin',
          at: serverTimestamp(),
        });
      }
      setStatusMsg(`✅ Survey ${status} successfully.`);
    } catch (err: any) {
      console.warn('Firestore updateDoc failed, updated locally:', err.message);
      // Update local storage so changes persist
      try {
        const local = JSON.parse(localStorage.getItem('local_resources') || '[]');
        const updated = local.map((item: any) => item.id === id ? { ...item, status } : item);
        localStorage.setItem('local_resources', JSON.stringify(updated));
      } catch {}
      setStatusMsg(`✅ Survey ${status} (saved locally).`);
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
        <h1 className={styles.title}>🛡️ Admin Dashboard</h1>
        <p className={styles.subtitle}>Real-time survey moderation and community resource management.</p>
        <div className={styles.statsRow}>
          <div className={styles.stat}><span>{pending.length}</span>Pending</div>
          <div className={styles.stat} style={{color:'var(--success)'}}><span>{approved.length}</span>Approved</div>
          <div className={styles.stat} style={{color:'var(--danger)'}}><span>{rejected.length}</span>Rejected</div>
          <div className={styles.stat}><span>{resources.length}</span>Total</div>
        </div>
        {error    && <p className={styles.errorMsg}>{error}</p>}
        {statusMsg && <p className={styles.statusMsg}>{statusMsg}</p>}
      </header>

      <div className={styles.grid}>
        {/* ─── Pending Approvals ─────────────────────────────────────────────── */}
        <section className={`glass-panel ${styles.panel}`}>
          <h2>⏳ Pending Surveys ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className={styles.empty}>No pending surveys — all clear! ✅</p>
          ) : (
            <div className={styles.cardList}>
              {pending.map(survey => (
                <div key={survey.id} className={styles.surveyCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.typeEmoji}>{TYPE_EMOJI[survey.type] ?? '📍'}</span>
                    <span className={styles.typeName}>{survey.type}</span>
                    <span className={styles.date}>
                      {survey.createdAt ? survey.createdAt.toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className={styles.locName}>{survey.locationName}</p>
                  <p className={styles.desc}>{survey.description}</p>
                  <p className={styles.coords}>📍 {survey.lat.toFixed(5)}, {survey.lng.toFixed(5)}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => updateStatus(survey.id, 'approved')}
                      disabled={updating === survey.id}
                    >
                      {updating === survey.id ? '…' : '✅ Approve'}
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
              ))}
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
            <h2>⚙️ System Management</h2>
            <ul className={styles.actionList}>

              {/* 1. Manage User Roles */}
              <li>
                <button
                  className={`${styles.actionBtn} ${activePanel === 'roles' ? styles.actionBtnActive : ''}`}
                  onClick={() => togglePanel('roles')}
                >
                  👥 Manage User Roles
                </button>
              </li>

              {/* 2. Generate PDF */}
              <li>
                <button
                  className={styles.actionBtn}
                  onClick={() => generatePDF(resources)}
                >
                  📄 Generate Report (PDF)
                </button>
              </li>

              {/* 3. Export CSV */}
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

              {/* 4. View Logs */}
              <li>
                <button
                  className={`${styles.actionBtn} ${activePanel === 'logs' ? styles.actionBtnActive : ''}`}
                  onClick={() => togglePanel('logs')}
                >
                  📋 View System Logs
                </button>
              </li>
            </ul>

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
