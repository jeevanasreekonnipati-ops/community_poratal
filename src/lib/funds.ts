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
    village: 'Mangalagiri / Guntur Rural',
    district: 'Guntur',
    category: 'water',
    amountAllocated: 450000,
    allocatedBy: 'District Collector Office',
    status: 'in-progress',
    remarks: 'Approved under Jal Jeevan Accelerated Village Grant. Covers 2,800 residents with pure drinking water.',
    sanctionedAt: new Date('2026-08-10'),
  },
  {
    id: 'fund-2',
    projectTitle: 'Primary Health Sub-Center Diagnostic & ECG Upgrade',
    village: 'Gannavaram / Vijayawada Urban',
    district: 'NTR / Krishna',
    category: 'healthcare',
    amountAllocated: 600000,
    allocatedBy: 'State Health Mission Authority',
    status: 'sanctioned',
    remarks: 'Procuring digital ECG machine, automated biochemistry analyzer, and 24x7 emergency oxygen points.',
    sanctionedAt: new Date('2026-08-22'),
  },
  {
    id: 'fund-3',
    projectTitle: 'Smart Digital Anganwadi & Classroom Infrastructure',
    village: 'Chandragiri / Tirupati Rural',
    district: 'Tirupati',
    category: 'education',
    amountAllocated: 320000,
    allocatedBy: 'Madu-Nedu Phase III Special Grant',
    status: 'completed',
    remarks: 'Modern interactive smart boards, child-friendly sanitary facilities, and clean nutrition storage completed.',
    sanctionedAt: new Date('2026-07-15'),
  },
  {
    id: 'fund-4',
    projectTitle: 'Panchayat Link Road CC Pavement & Storm Drainage',
    village: 'Bhimavaram Rural',
    district: 'West Godavari',
    category: 'roads',
    amountAllocated: 850000,
    allocatedBy: 'Panchayat Raj & Rural Development Grant',
    status: 'in-progress',
    remarks: '1.2 km heavy-duty concrete road connecting village farming belt to the state highway.',
    sanctionedAt: new Date('2026-08-30'),
  },
  {
    id: 'fund-5',
    projectTitle: 'Community Solar Cold Storage Unit for Horticulture',
    village: 'Tadipatri / Anantapur Rural',
    district: 'Anantapur',
    category: 'support',
    amountAllocated: 750000,
    allocatedBy: 'Rythu Bharosa Accelerated Agri Grant',
    status: 'sanctioned',
    remarks: '10-tonne solar-powered cold storage facility to prevent post-harvest perishables spoilage for 180 farmer families.',
    sanctionedAt: new Date('2026-09-01'),
  },
  {
    id: 'fund-6',
    projectTitle: 'Coastal Village Cyclone Resilient Flood Drainage Channel',
    village: 'Bheemunipatnam',
    district: 'Visakhapatnam',
    category: 'sanitation',
    amountAllocated: 900000,
    allocatedBy: 'Disaster Management & Infrastructure Fund',
    status: 'in-progress',
    remarks: 'Concrete lined stormwater flood canal to prevent seawater backflow and monsoon inundation in residential wards.',
    sanctionedAt: new Date('2026-08-18'),
  },
  {
    id: 'fund-7',
    projectTitle: 'Solid Waste Processing & Bio-Gas Generator Unit',
    village: 'Tenali Rural',
    district: 'Guntur',
    category: 'sanitation',
    amountAllocated: 400000,
    allocatedBy: 'Swachh Andhra Mission Grant',
    status: 'completed',
    remarks: 'Daily 2-tonne wet waste segregation and bio-gas generator providing street light power for 3 wards.',
    sanctionedAt: new Date('2026-07-28'),
  },
  {
    id: 'fund-8',
    projectTitle: 'Solar Agriculture Feeder Pump Micro-Grid',
    village: 'Dhone / Kurnool Rural',
    district: 'Kurnool',
    category: 'support',
    amountAllocated: 650000,
    allocatedBy: 'Renewable Energy & Panchayat Power Mission',
    status: 'in-progress',
    remarks: 'Dedicated 25 kW solar microgrid powering 12 community farm borewells with zero electricity tariff for smallholders.',
    sanctionedAt: new Date('2026-08-25'),
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
