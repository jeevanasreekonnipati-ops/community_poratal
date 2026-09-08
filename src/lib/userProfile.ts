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
  localStorage.setItem(`userProfile_${profile.uid}`, JSON.stringify(profile));
  localStorage.setItem('userProfile', JSON.stringify(profile));
  
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
  if (!uid) return null;

  // 1. Check exact user cached profile first
  const exactCached = localStorage.getItem(`userProfile_${uid}`);
  if (exactCached) {
    try {
      const parsed = JSON.parse(exactCached) as UserProfile;
      if (parsed.uid === uid) return parsed;
    } catch {}
  }

  // 2. Fetch fresh record from Firestore
  try {
    if (db) {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        localStorage.setItem(`userProfile_${uid}`, JSON.stringify(data));
        localStorage.setItem('userProfile', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Firestore getDoc failed, falling back to local storage:', err);
  }

  // 3. Check general cache only if UID matches
  const globalCached = localStorage.getItem('userProfile');
  if (globalCached) {
    try {
      const parsed = JSON.parse(globalCached) as UserProfile;
      if (parsed.uid === uid) return parsed;
    } catch {}
  }

  return null;
}

export function clearProfileCache(uid?: string) {
  if (uid) {
    localStorage.removeItem(`userProfile_${uid}`);
  }
  localStorage.removeItem('userProfile');
  localStorage.removeItem('active_user_role');
}



// ─── Verified Initial Data for Andhra Pradesh ────────────────
const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-ap-1',
    citizenId: 'cit-101',
    citizenName: 'Ramesh Naidu',
    age: '42',
    mobile: '9848012345',
    village: 'Mangalagiri',
    district: 'Guntur',
    homeCondition: 'Good',
    surroundingCondition: 'Drainage blockage near temple street',
    schemesReceiving: ['aarogyasri', 'rythu_bharosa'],
    schemesNotReceiving: ['jal_jeevan'],
    specificProblem: 'Drinking water pipeline pressure is inadequate in Ward 4. RO water filtration required.',
    lat: 16.4320,
    lng: 80.5680,
    status: 'resolved',
    adminResponse: 'RO filter pipeline replaced and pressure verified by Assistant Engineer.',
    adminName: 'Guntur Secretary',
  },
  {
    id: 'sub-ap-2',
    citizenId: 'cit-102',
    citizenName: 'Lakshmi Devi',
    age: '38',
    mobile: '9848023456',
    village: 'Gannavaram',
    district: 'NTR / Krishna',
    homeCondition: 'Fair',
    surroundingCondition: 'Street lighting needs maintenance',
    schemesReceiving: ['amma_vodi', 'aarogyasri'],
    schemesNotReceiving: ['pmay', 'mgnregs'],
    specificProblem: 'Pending pucca house sanction under PMAY despite document verification at Sachivalayam.',
    lat: 16.5385,
    lng: 80.7997,
    status: 'in-progress',
    adminResponse: 'Application uploaded to housing portal; physical geo-tagging scheduled.',
    adminName: 'Vijayawada Secretary',
  },
  {
    id: 'sub-ap-3',
    citizenId: 'cit-103',
    citizenName: 'K. Venkatesh',
    age: '49',
    mobile: '9848034567',
    village: 'Bheemunipatnam',
    district: 'Visakhapatnam',
    homeCondition: 'Pucca',
    surroundingCondition: 'Beach road approach damaged after rains',
    schemesReceiving: ['rythu_bharosa'],
    schemesNotReceiving: ['jal_jeevan', 'cheyutha'],
    specificProblem: 'Frequent electrical supply fluctuations causing farm borewell motor damage.',
    lat: 17.8912,
    lng: 83.4542,
    status: 'pending',
    adminResponse: '',
    adminName: 'Vizag Secretary',
  },
  {
    id: 'sub-ap-4',
    citizenId: 'cit-104',
    citizenName: 'Sita Raman',
    age: '55',
    mobile: '9848045678',
    village: 'Chandragiri',
    district: 'Tirupati',
    homeCondition: 'Fair',
    surroundingCondition: 'Sanitation cleaning pending near school',
    schemesReceiving: ['aarogyasri', 'pension_kanuka'],
    schemesNotReceiving: ['vidya_deevena'],
    specificProblem: 'Primary health sub-center doctor attendance irregular on Tuesdays and Thursdays.',
    lat: 13.5850,
    lng: 79.3170,
    status: 'resolved',
    adminResponse: 'Medical officer roster updated and bio-metric attendance enforced.',
    adminName: 'Tirupati Secretary',
  },
  {
    id: 'sub-ap-5',
    citizenId: 'cit-105',
    citizenName: 'Abdul Kareem',
    age: '34',
    mobile: '9848056789',
    village: 'Dhone',
    district: 'Kurnool',
    homeCondition: 'Good',
    surroundingCondition: 'Waterlogging during heavy downpours',
    schemesReceiving: ['aarogyasri'],
    schemesNotReceiving: ['rythu_bharosa', 'jal_jeevan'],
    specificProblem: 'Desilting needed for main irrigation canal connecting east agriculture fields.',
    lat: 15.4200,
    lng: 77.8700,
    status: 'in-progress',
    adminResponse: 'Panchayat tractor and JCB deployed for canal desilting.',
    adminName: 'Kurnool Secretary',
  },
  {
    id: 'sub-ap-6',
    citizenId: 'cit-106',
    citizenName: 'Prasad Rao',
    age: '46',
    mobile: '9848067890',
    village: 'Tenali',
    district: 'Guntur',
    homeCondition: 'Pucca',
    surroundingCondition: 'Clean, solid waste collection operational',
    schemesReceiving: ['amma_vodi', 'aarogyasri', 'rythu_bharosa'],
    schemesNotReceiving: [],
    specificProblem: 'Smart digital classroom projector repair needed at ZP High School.',
    lat: 16.2430,
    lng: 80.6400,
    status: 'resolved',
    adminResponse: 'Nadu-Nedu technical engineer replaced optical lamp unit.',
    adminName: 'Guntur Secretary',
  }
];

const DEFAULT_MONTHLY_REPORTS: MonthlyReport[] = [
  {
    id: 'rep-m-1',
    reporterRole: 'admin',
    reporterId: 'adm-101',
    reporterName: 'Panchayat Secretary (Mangalagiri)',
    village: 'Mangalagiri',
    district: 'Guntur',
    month: 'August 2026',
    totalSubmissions: 28,
    resolved: 24,
    pending: 3,
    inProgress: 1,
    resolutionRate: 86,
    flaggedIssues: 'Canal maintenance; transformer capacity upgrade',
    summaryNote: 'High citizen participation. All drinking water complaints resolved within 24 hours.',
    sentToOptimizer: true,
    sentToAuthority: true,
  },
  {
    id: 'rep-m-2',
    reporterRole: 'admin',
    reporterId: 'adm-102',
    reporterName: 'Panchayat Secretary (Gannavaram)',
    village: 'Gannavaram',
    district: 'NTR / Krishna',
    month: 'August 2026',
    totalSubmissions: 35,
    resolved: 29,
    pending: 4,
    inProgress: 2,
    resolutionRate: 83,
    flaggedIssues: 'PMAY housing documentation backlogs',
    summaryNote: 'Panchayat solid waste management 100% compliant. Housing verification ongoing.',
    sentToOptimizer: true,
    sentToAuthority: true,
  },
  {
    id: 'rep-m-3',
    reporterRole: 'optimizer',
    reporterId: 'opt-201',
    reporterName: 'MRO Vijayawada Mandal',
    district: 'NTR / Krishna',
    month: 'August 2026',
    totalSubmissions: 112,
    resolved: 94,
    pending: 12,
    inProgress: 6,
    resolutionRate: 84,
    flaggedIssues: 'Bheemunipatnam (low resolution on agriculture complaints)',
    summaryNote: 'Mandal level performance score is 84%. Forwarding special grant request for RO plant.',
    sentToOptimizer: true,
    sentToAuthority: true,
  }
];

export async function submitCitizenReport(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>) {
  const localId = `sub-${Date.now()}`;
  try {
    const local = JSON.parse(localStorage.getItem('local_submissions') || '[]');
    local.unshift({ id: localId, ...data });
    localStorage.setItem('local_submissions', JSON.stringify(local));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('submissions_updated'));
    }
  } catch {}

  try {
    const ref = await addDoc(collection(db, 'submissions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn('Firestore addDoc failed, stored locally:', err);
    return localId;
  }
}

export async function getSubmissionsByVillage(village: string): Promise<Submission[]> {
  const all = await getAllSubmissions();
  return all.filter(s => s.village.toLowerCase() === village.toLowerCase());
}

export async function getSubmissionsByCitizen(citizenId: string): Promise<Submission[]> {
  const all = await getAllSubmissions();
  return all.filter(s => s.citizenId === citizenId);
}

export async function getAllSubmissions(): Promise<Submission[]> {
  let list = [...DEFAULT_SUBMISSIONS];

  // 1. Merge locally stored submissions
  try {
    const local = typeof window !== 'undefined' ? localStorage.getItem('local_submissions') : null;
    if (local) {
      const parsed = JSON.parse(local);
      list = [...parsed, ...list.filter(p => !parsed.some((x: any) => x.id === p.id))];
    }
  } catch {}

  // 2. Also map survey entries from local_resources so everything reported on map shows in Optimizer
  try {
    const localRes = typeof window !== 'undefined' ? localStorage.getItem('local_resources') : null;
    if (localRes) {
      const parsedRes = JSON.parse(localRes);
      parsedRes.forEach((r: any) => {
        if (!list.some(s => s.id === r.id)) {
          list.unshift({
            id: r.id,
            citizenId: r.citizenId || 'citizen',
            citizenName: r.citizenName || 'Local Resident',
            age: '30',
            mobile: '9848011223',
            village: r.locationName?.split(',')[0] || 'Vijayawada Rural',
            district: 'NTR / Krishna',
            homeCondition: 'Good',
            surroundingCondition: r.description || '',
            schemesReceiving: ['aarogyasri'],
            schemesNotReceiving: r.type === 'sanitation' ? ['jal_jeevan'] : [],
            specificProblem: `[${r.type?.toUpperCase()}] ${r.locationName}: ${r.description}`,
            lat: r.lat,
            lng: r.lng,
            status: r.status === 'approved' ? 'resolved' : r.status === 'rejected' ? 'resolved' : 'pending',
            adminResponse: r.status === 'approved' ? 'Approved by Panchayat Secretary' : '',
            adminName: 'Panchayat Secretary',
          });
        }
      });
    }
  } catch {}

  // 3. Fetch from Firestore if accessible
  try {
    if (db) {
      const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreSubs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
        list = [...firestoreSubs, ...list.filter(item => !firestoreSubs.some(f => f.id === item.id))];
      }
    }
  } catch (err) {
    console.warn('Firestore getAllSubmissions fallback active:', err);
  }

  return list;
}

export async function adminRespondToSubmission(
  submissionId: string,
  adminId: string,
  adminName: string,
  response: string,
  status: 'in-progress' | 'resolved'
) {
  try {
    const local = JSON.parse(localStorage.getItem('local_submissions') || '[]');
    const idx = local.findIndex((s: any) => s.id === submissionId);
    if (idx >= 0) {
      local[idx].adminResponse = response;
      local[idx].adminId = adminId;
      local[idx].adminName = adminName;
      local[idx].status = status;
      localStorage.setItem('local_submissions', JSON.stringify(local));
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('submissions_updated'));
    }
  } catch {}

  try {
    if (db) {
      await updateDoc(doc(db, 'submissions', submissionId), {
        adminResponse: response,
        adminId,
        adminName,
        status,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('adminRespondToSubmission failed:', err);
  }
}

// ─── Monthly Report Helpers ────────────────────────────────

export async function saveMonthlyReport(report: Omit<MonthlyReport, 'id' | 'createdAt'>) {
  const localId = `rep-${Date.now()}`;
  const newReport: MonthlyReport = { id: localId, ...report };

  try {
    const local = JSON.parse(localStorage.getItem('local_monthly_reports') || '[]');
    local.unshift(newReport);
    localStorage.setItem('local_monthly_reports', JSON.stringify(local));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('reports_updated'));
  } catch {}

  try {
    if (db) {
      const ref = await addDoc(collection(db, 'monthly_reports'), {
        ...report,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    }
  } catch {
    console.warn('saveMonthlyReport firestore fallback applied');
  }
  return localId;
}

export async function getMonthlyReports(filters?: {
  role?: 'admin' | 'optimizer';
  reporterId?: string;
  sentToAuthority?: boolean;
}): Promise<MonthlyReport[]> {
  let list = [...DEFAULT_MONTHLY_REPORTS];

  try {
    const local = typeof window !== 'undefined' ? localStorage.getItem('local_monthly_reports') : null;
    if (local) {
      const parsed = JSON.parse(local);
      list = [...parsed, ...list.filter(p => !parsed.some((x: any) => x.id === p.id))];
    }
  } catch {}

  try {
    if (db) {
      let q = query(collection(db, 'monthly_reports'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreReports = snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyReport));
        list = [...firestoreReports, ...list.filter(item => !firestoreReports.some(f => f.id === item.id))];
      }
    }
  } catch {}

  if (filters?.role) list = list.filter(r => r.reporterRole === filters.role);
  if (filters?.reporterId) list = list.filter(r => r.reporterId === filters.reporterId);
  if (filters?.sentToAuthority !== undefined) list = list.filter(r => r.sentToAuthority === filters.sentToAuthority);

  return list;
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
