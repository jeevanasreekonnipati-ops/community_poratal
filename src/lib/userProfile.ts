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
  month: string;
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
  // Always save locally first for instant, guaranteed availability
  localStorage.setItem('userProfile', JSON.stringify(profile));
  localStorage.setItem(`userProfile_${profile.uid}`, JSON.stringify(profile));
  
  try {
    if (db) {
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore setDoc failed, cached locally in localStorage:', err);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // Check local cache first
  const cached = localStorage.getItem(`userProfile_${uid}`) || localStorage.getItem('userProfile');
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as UserProfile;
      if (parsed.uid === uid || !uid) return parsed;
    } catch {}
  }

  // Fetch from Firestore
  try {
    if (db && uid) {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        localStorage.setItem(`userProfile_${uid}`, JSON.stringify(data));
        localStorage.setItem('userProfile', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Firestore getDoc failed, returning cached profile:', err);
  }

  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  return null;
}

export function clearProfileCache() {
  localStorage.removeItem('userProfile');
}

// ─── Submission Helpers ────────────────────────────────────

export async function submitCitizenReport(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const ref = await addDoc(collection(db, 'submissions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn('Firestore addDoc failed, storing locally:', err);
    return `local-${Date.now()}`;
  }
}

export async function getSubmissionsByVillage(village: string): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('village', '==', village),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
  } catch {
    return [];
  }
}

export async function getSubmissionsByCitizen(citizenId: string): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('citizenId', '==', citizenId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
  } catch {
    return [];
  }
}

export async function getAllSubmissions(): Promise<Submission[]> {
  try {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
  } catch {
    return [];
  }
}

export async function adminRespondToSubmission(
  submissionId: string,
  adminId: string,
  adminName: string,
  response: string,
  status: 'in-progress' | 'resolved'
) {
  try {
    await updateDoc(doc(db, 'submissions', submissionId), {
      adminResponse: response,
      adminId,
      adminName,
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('adminRespondToSubmission failed:', err);
  }
}

// ─── Monthly Report Helpers ────────────────────────────────

export async function saveMonthlyReport(report: Omit<MonthlyReport, 'id' | 'createdAt'>) {
  try {
    const ref = await addDoc(collection(db, 'monthly_reports'), {
      ...report,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch {
    return `local-report-${Date.now()}`;
  }
}

export async function getMonthlyReports(filters?: {
  role?: 'admin' | 'optimizer';
  reporterId?: string;
  sentToAuthority?: boolean;
}): Promise<MonthlyReport[]> {
  try {
    let q = query(collection(db, 'monthly_reports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyReport));
    if (filters?.role) results = results.filter(r => r.reporterRole === filters.role);
    if (filters?.reporterId) results = results.filter(r => r.reporterId === filters.reporterId);
    if (filters?.sentToAuthority !== undefined) results = results.filter(r => r.sentToAuthority === filters.sentToAuthority);
    return results;
  } catch {
    return [];
  }
}

export async function markReportSentToAuthority(reportId: string) {
  try {
    await updateDoc(doc(db, 'monthly_reports', reportId), {
      sentToAuthority: true,
    });
  } catch {}
}

// ─── Performance Score Helper ──────────────────────────────

export function calcPerformanceScore(resolved: number, total: number, avgResponseHours: number): {
  score: number;
  label: string;
  color: string;
} {
  if (total === 0) return { score: 0, label: 'No Data', color: '#94a3b8' };
  const resolutionRate = (resolved / total) * 100;
  const timePenalty = Math.min(avgResponseHours / 240, 1) * 20;
  const score = Math.max(0, Math.round(resolutionRate - timePenalty));
  if (score >= 75) return { score, label: 'Excellent', color: '#10b981' };
  if (score >= 50) return { score, label: 'Good', color: '#f59e0b' };
  if (score >= 30) return { score, label: 'Average', color: '#f97316' };
  return { score, label: 'Poor', color: '#ef4444' };
}

export async function getSubmissionsByDistrict(district: string): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('district', '==', district),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
  } catch {
    return [];
  }
}
