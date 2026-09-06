'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export type ResourceEntry = {
  id: string;
  type: string;
  lat: number;
  lng: number;
  locationName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date | null;
  citizenId?: string;
  citizenEmail?: string;
  citizenName?: string;
};

// Initial verified demo markers across Andhra Pradesh
const DEFAULT_DEMO_RESOURCES: ResourceEntry[] = [
  {
    id: 'demo-1',
    type: 'school',
    lat: 16.5062,
    lng: 80.6480,
    locationName: 'Z.P. High School, Vijayawada',
    description: 'Smart classrooms operational; playground requires maintenance.',
    status: 'approved',
    createdAt: new Date('2026-08-15'),
  },
  {
    id: 'demo-2',
    type: 'hospital',
    lat: 17.6868,
    lng: 83.2185,
    locationName: 'King George Hospital (KGH), Visakhapatnam',
    description: '24/7 Emergency & ICU facilities with dialysis unit.',
    status: 'approved',
    createdAt: new Date('2026-08-20'),
  },
  {
    id: 'demo-3',
    type: 'sanitation',
    lat: 16.3067,
    lng: 80.4365,
    locationName: 'Jal Jeevan Water Treatment Plant, Guntur',
    description: 'Clean RO drinking water supply covering 3 surrounding panchayats.',
    status: 'approved',
    createdAt: new Date('2026-08-25'),
  },
  {
    id: 'demo-4',
    type: 'transport',
    lat: 13.6288,
    lng: 79.4192,
    locationName: 'APSRTC Central Bus Depot, Tirupati',
    description: 'Electric bus fleet operational with passenger amenities.',
    status: 'approved',
    createdAt: new Date('2026-08-28'),
  },
];

/**
 * Real-time listener hook — subscribes to Firestore 'resources' collection
 * with resilient offline & permission fallback.
 */
export function useResources() {
  const [resources, setResources] = useState<ResourceEntry[]>(DEFAULT_DEMO_RESOURCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load local stored surveys if any
    const localSaved = localStorage.getItem('local_resources');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved).map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        }));
        setResources(prev => [...parsed, ...prev.filter(p => !parsed.some((x: any) => x.id === p.id))]);
      } catch {}
    }

    try {
      const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data: ResourceEntry[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ResourceEntry, 'id'>),
            createdAt: doc.data().createdAt?.toDate() ?? null,
          }));

          if (data.length > 0) {
            setResources(data);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('Firestore permissions/connection fallback active:', err.message);
          // Keep demo resources and clear loading without blocking UI
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.warn('Firestore subscription failed, running in fallback mode:', err);
      setLoading(false);
    }
  }, []);

  return { resources, loading, error };
}

/**
 * Submit a new resource survey entry to Firestore + LocalStorage fallback.
 */
export async function submitResource(data: Omit<ResourceEntry, 'id' | 'createdAt' | 'status'>) {
  const newEntry: ResourceEntry = {
    id: `local-res-${Date.now()}`,
    ...data,
    status: 'pending',
    createdAt: new Date(),
  };

  // Save to local storage for immediate persistence
  try {
    const existing = JSON.parse(localStorage.getItem('local_resources') || '[]');
    existing.unshift(newEntry);
    localStorage.setItem('local_resources', JSON.stringify(existing));
  } catch {}

  // Attempt Firestore write
  try {
    if (db) {
      await addDoc(collection(db, 'resources'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    }
  } catch (err: any) {
    console.warn('Firestore addDoc permissions fallback applied:', err.message);
  }
}
