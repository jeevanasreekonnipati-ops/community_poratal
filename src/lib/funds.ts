'use client';

import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

export interface FundAllocation {
  id: string;
  projectTitle: string;
  village: string;
  district: string;
  category: 'water' | 'sanitation' | 'education' | 'healthcare' | 'roads' | 'support';
  amountAllocated: number; // in INR
  allocatedBy: string; // e.g. District Collector
  status: 'sanctioned' | 'in-progress' | 'completed';
  remarks: string;
  sanctionedAt: Date;
}

const DEFAULT_ALLOCATIONS: FundAllocation[] = [
  {
    id: 'fund-1',
    projectTitle: 'Solar RO Water Treatment Plant Installation',
    village: 'Guntur Rural',
    district: 'Guntur',
    category: 'water',
    amountAllocated: 450000,
    allocatedBy: 'District Collector Office',
    status: 'in-progress',
    remarks: 'Approved under Jal Jeevan Accelerated Village Grant. Covers 2,800 residents.',
    sanctionedAt: new Date('2026-08-10'),
  },
  {
    id: 'fund-2',
    projectTitle: 'Primary Health Sub-Center Diagnostic Upgrade',
    village: 'Vijayawada Urban',
    district: 'NTR / Krishna',
    category: 'healthcare',
    amountAllocated: 600000,
    allocatedBy: 'State Health Mission Authority',
    status: 'sanctioned',
    remarks: 'Procuring digital ECG and automated biochemistry analyzer.',
    sanctionedAt: new Date('2026-08-22'),
  },
  {
    id: 'fund-3',
    projectTitle: 'Smart Digital Anganwadi & Classroom Infrastructure',
    village: 'Tirupati Rural',
    district: 'Tirupati',
    category: 'education',
    amountAllocated: 320000,
    allocatedBy: 'Madu-Nedu Phase III Special Grant',
    status: 'completed',
    remarks: 'Modern interactive smart boards and child-friendly sanitary facilities completed.',
    sanctionedAt: new Date('2026-07-15'),
  },
  {
    id: 'fund-4',
    projectTitle: 'Panchayat Link Road CC Pavement & Drainage',
    village: 'Bhimavaram',
    district: 'West Godavari',
    category: 'roads',
    amountAllocated: 850000,
    allocatedBy: 'Panchayat Raj & Rural Development Grant',
    status: 'in-progress',
    remarks: '1.2 km concrete road to connecting state highway.',
    sanctionedAt: new Date('2026-08-30'),
  },
];

export async function getFundAllocations(): Promise<FundAllocation[]> {
  try {
    const local = typeof window !== 'undefined' ? localStorage.getItem('fund_allocations') : null;
    let funds = local ? JSON.parse(local).map((f: any) => ({ ...f, sanctionedAt: new Date(f.sanctionedAt) })) : [...DEFAULT_ALLOCATIONS];

    if (db) {
      const q = query(collection(db, 'development_funds'), orderBy('sanctionedAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreFunds = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<FundAllocation, 'id'>),
          sanctionedAt: doc.data().sanctionedAt?.toDate ? doc.data().sanctionedAt.toDate() : new Date(),
        }));
        funds = [...firestoreFunds];
      }
    }
    return funds;
  } catch {
    return DEFAULT_ALLOCATIONS;
  }
}

export async function allocateDevelopmentFund(fund: Omit<FundAllocation, 'id' | 'sanctionedAt'>): Promise<string> {
  const newFund: FundAllocation = {
    id: `fund-${Date.now()}`,
    ...fund,
    sanctionedAt: new Date(),
  };

  try {
    const local = JSON.parse(localStorage.getItem('fund_allocations') || '[]');
    local.unshift(newFund);
    localStorage.setItem('fund_allocations', JSON.stringify(local));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('funds_updated', { detail: newFund }));
    }
  } catch {}

  try {
    if (db) {
      const ref = await addDoc(collection(db, 'development_funds'), {
        ...fund,
        sanctionedAt: serverTimestamp(),
      });
      return ref.id;
    }
  } catch (err) {
    console.warn('Firestore allocate fund fallback applied:', err);
  }

  return newFund.id;
}
