import { db, auth } from './firebase';
import {
  doc, getDoc, setDoc, serverTimestamp,
  collection, addDoc, query, where, orderBy,
  getDocs, updateDoc, Timestamp
} from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  name: string;
  age: string;
  mobile: string;
  role: 'citizen' | 'admin' | 'optimizer' | 'authority';
  village: string;
  district: string;
  state: string;
  email: string;
  createdAt?: Timestamp;
};

export type Submission = {
  id?: string;
  citizenId: string;
  citizenName: string;
  age: string;
  mobile: string;
  village: string;
  district: string;
  homeCondition: string;
  surroundingCondition: string;
  schemesReceiving: string[];
  schemesNotReceiving: string[];
  specificProblem: string;
  lat?: number;
  lng?: number;
  status: 'pending' | 'in-progress' | 'resolved';
  adminResponse?: string;
  adminId?: string;
  adminName?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type MonthlyReport = {
  id?: string;
  reporterRole: 'admin' | 'optimizer';
  reporterId: string;
  reporterName: string;
  village?: string;
  district?: string;
  month: string; // e.g. "June 2025"
  totalSubmissions: number;
  resolved: number;
  pending: number;
  inProgress: number;
  resolutionRate: number;
  flaggedIssues: string;
  summaryNote: string;
  sentToOptimizer?: boolean;
  sentToAuthority?: boolean;
  createdAt?: Timestamp;
};

// ─── Profile Helpers ───────────────────────────────────────

export async function saveUserProfile(profile: Omit<UserProfile, 'createdAt'>) {
  await setDoc(doc(db, 'users', profile.uid), {
    ...profile,
    createdAt: serverTimestamp(),
  }, { merge: true });
  localStorage.setItem('userProfile', JSON.stringify(profile));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // Try cache first
  const cached = localStorage.getItem('userProfile');
  if (cached) {
    const parsed = JSON.parse(cached) as UserProfile;
    if (parsed.uid === uid) return parsed;
  }
  // Fetch from Firestore
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    localStorage.setItem('userProfile', JSON.stringify(data));
    return data;
  }
  return null;
}

export function clearProfileCache() {
  localStorage.removeItem('userProfile');
}

// ─── Submission Helpers ────────────────────────────────────

export async function submitCitizenReport(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, 'submissions'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSubmissionsByVillage(village: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('village', '==', village),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
}

export async function getSubmissionsByCitizen(citizenId: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('citizenId', '==', citizenId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
}

export async function adminRespondToSubmission(
  submissionId: string,
  adminId: string,
  adminName: string,
  response: string,
  status: 'in-progress' | 'resolved'
) {
  await updateDoc(doc(db, 'submissions', submissionId), {
    adminResponse: response,
    adminId,
    adminName,
    status,
    updatedAt: serverTimestamp(),
  });
}

// ─── Monthly Report Helpers ────────────────────────────────

export async function saveMonthlyReport(report: Omit<MonthlyReport, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'monthly_reports'), {
    ...report,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMonthlyReports(filters?: {
  role?: 'admin' | 'optimizer';
  reporterId?: string;
  sentToAuthority?: boolean;
}): Promise<MonthlyReport[]> {
  let q = query(collection(db, 'monthly_reports'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyReport));
  if (filters?.role) results = results.filter(r => r.reporterRole === filters.role);
  if (filters?.reporterId) results = results.filter(r => r.reporterId === filters.reporterId);
  if (filters?.sentToAuthority !== undefined) results = results.filter(r => r.sentToAuthority === filters.sentToAuthority);
  return results;
}

export async function markReportSentToAuthority(reportId: string) {
  await updateDoc(doc(db, 'monthly_reports', reportId), {
    sentToAuthority: true,
  });
}

// ─── Performance Score Helper ──────────────────────────────

export function calcPerformanceScore(resolved: number, total: number, avgResponseHours: number): {
  score: number;
  label: string;
  color: string;
} {
  if (total === 0) return { score: 0, label: 'No Data', color: '#94a3b8' };
  const resolutionRate = (resolved / total) * 100;
  // Penalise slow responses
  const timePenalty = Math.min(avgResponseHours / 240, 1) * 20; // max 20pt penalty for 10+ days
  const score = Math.max(0, Math.round(resolutionRate - timePenalty));
  if (score >= 75) return { score, label: 'Excellent', color: '#10b981' };
  if (score >= 50) return { score, label: 'Good', color: '#f59e0b' };
  if (score >= 30) return { score, label: 'Average', color: '#f97316' };
  return { score, label: 'Poor', color: '#ef4444' };
}

// ─── Additional Helpers for Enhanced Features ──────────────

export async function getSubmissionsByDistrict(district: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('district', '==', district),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
}

export async function savePerformanceScore(
  officialId: string,
  officialRole: 'admin' | 'optimizer',
  scores: any
) {
  await setDoc(doc(db, 'performance_scores', `${officialId}-${scores.month}`), {
    ...scores,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function getPerformanceScores(officialId: string) {
  const q = query(
    collection(db, 'performance_scores'),
    where('officialId', '==', officialId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getSubmissionsInDateRange(
  village: string,
  startDate: Date,
  endDate: Date
): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('village', '==', village),
    where('createdAt', '>=', startDate),
    where('createdAt', '<=', endDate),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
}
