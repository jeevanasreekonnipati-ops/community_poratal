'use client';

import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface VillageNotice {
  id: string;
  title: string;
  category: 'health' | 'water' | 'agriculture' | 'welfare' | 'alert';
  message: string;
  village: string;
  district?: string;
  priority: 'urgent' | 'important' | 'info';
  publishedBy: string;
  createdAt: Date;
}

const DEFAULT_NOTICES: VillageNotice[] = [
  {
    id: 'notice-1',
    title: '🏥 Free Ayushman Arogya Health Camp',
    category: 'health',
    message: 'Free general health checkup, sugar/BP tests, and free medicines distribution at Sachivalayam Community Hall this Saturday 9 AM - 4 PM.',
    village: 'All Villages / Guntur & Krishna',
    priority: 'important',
    publishedBy: 'Health Supervisor & Secretary',
    createdAt: new Date('2026-09-05'),
  },
  {
    id: 'notice-2',
    title: '🚰 Jal Jeevan Pipeline Maintenance',
    category: 'water',
    message: 'Overhead tank cleaning and feeder pipeline maintenance scheduled for tomorrow between 10:00 AM and 2:00 PM. Water supply will resume normally by evening.',
    village: 'Vijayawada Rural & Guntur',
    priority: 'urgent',
    publishedBy: 'Panchayat Engineering Assistant',
    createdAt: new Date('2026-09-06'),
  },
  {
    id: 'notice-3',
    title: '🌾 Rythu Bharosa Seed & Fertilizer Subsidy Camp',
    category: 'agriculture',
    message: 'Registered farmers can collect subsidized high-yield seeds and bio-fertilizers from the Rythu Bharosa Kendra (RBK) counter.',
    village: 'All Mandals',
    priority: 'info',
    publishedBy: 'Agriculture Officer',
    createdAt: new Date('2026-09-07'),
  }
];

export async function getVillageNotices(): Promise<VillageNotice[]> {
  try {
    const local = typeof window !== 'undefined' ? localStorage.getItem('village_notices') : null;
    let notices = local ? JSON.parse(local).map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })) : [...DEFAULT_NOTICES];

    if (db) {
      const q = query(collection(db, 'village_notices'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreNotices = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<VillageNotice, 'id'>),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        }));
        notices = [...firestoreNotices];
      }
    }
    return notices;
  } catch {
    return DEFAULT_NOTICES;
  }
}

export async function publishVillageNotice(notice: Omit<VillageNotice, 'id' | 'createdAt'>): Promise<string> {
  const newNotice: VillageNotice = {
    id: `notice-${Date.now()}`,
    ...notice,
    createdAt: new Date(),
  };

  // Local storage cache
  try {
    const local = JSON.parse(localStorage.getItem('village_notices') || '[]');
    local.unshift(newNotice);
    localStorage.setItem('village_notices', JSON.stringify(local));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notices_updated', { detail: newNotice }));
    }
  } catch {}

  // Firestore sync
  try {
    if (db) {
      const ref = await addDoc(collection(db, 'village_notices'), {
        ...notice,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    }
  } catch (err) {
    console.warn('Firestore publish notice fallback applied:', err);
  }

  return newNotice.id;
}
