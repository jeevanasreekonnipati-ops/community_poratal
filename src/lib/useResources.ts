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
 * with resilient offline & permission fallback, and instant cross-tab & local state reactivity.
 */
export function useResources() {
  const [resources, setResources] = useState<ResourceEntry[]>(DEFAULT_DEMO_RESOURCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = (firestoreData?: ResourceEntry[]) => {
    let combined = firestoreData && firestoreData.length > 0 ? [...firestoreData] : [...DEFAULT_DEMO_RESOURCES];
    
    // Merge locally submitted/updated resources
    try {
      const localSaved = localStorage.getItem('local_resources');
      if (localSaved) {
        const parsed: ResourceEntry[] = JSON.parse(localSaved).map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        }));
        
        // Merge without duplicates, preferring latest local updates for matching IDs
        parsed.forEach(localItem => {
          const idx = combined.findIndex(c => c.id === localItem.id);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...localItem };
          } else {
            combined.unshift(localItem);
          }
        });
      }
    } catch {}

    setResources(combined);
  };

  useEffect(() => {
    loadAll();

    // Listen for internal local changes
    const handleLocalUpdate = () => {
      loadAll();
    };
    window.addEventListener('resources_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    let unsubscribe = () => {};

    try {
      const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data: ResourceEntry[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ResourceEntry, 'id'>),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : (doc.data().createdAt ? new Date(doc.data().createdAt) : null),
          }));

          loadAll(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('Firestore permissions/connection fallback active:', err.message);
          loadAll();
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.warn('Firestore subscription failed, running in fallback mode:', err);
      loadAll();
      setLoading(false);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('resources_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }, []);

  return { resources, loading, error };
}

/**
 * Submit a new resource survey entry to Firestore + LocalStorage fallback.
 * Broadcasts real-time event to update all active dashboard components immediately.
 */
export async function submitResource(data: Omit<ResourceEntry, 'id' | 'createdAt' | 'status'>) {
  const newEntry: ResourceEntry = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    status: 'pending',
    createdAt: new Date(),
  };

  // Save to local storage for immediate persistence
  try {
    const existing = JSON.parse(localStorage.getItem('local_resources') || '[]');
    existing.unshift(newEntry);
    localStorage.setItem('local_resources', JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('resources_updated', { detail: newEntry }));
  } catch {}

  // Attempt Firestore write
  try {
    if (db) {
      const docRef = await addDoc(collection(db, 'resources'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      // Also update local copy with Firestore ID if needed
      return docRef.id;
    }
  } catch (err: any) {
    console.warn('Firestore addDoc permissions fallback applied:', err.message);
  }
  return newEntry.id;
}

/**
 * Update resource status (e.g., approved/rejected by Admin) in real time across the app.
 */
export async function updateResourceStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
  // Update local storage first for instant zero-latency UI update
  try {
    const local = JSON.parse(localStorage.getItem('local_resources') || '[]');
    const existingIdx = local.findIndex((item: any) => item.id === id);
    if (existingIdx >= 0) {
      local[existingIdx].status = status;
    } else {
      local.push({ id, status });
    }
    localStorage.setItem('local_resources', JSON.stringify(local));
    window.dispatchEvent(new CustomEvent('resources_updated', { detail: { id, status } }));
  } catch {}

  // Update in Firestore
  try {
    if (db) {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'resources', id), { status });
    }
  } catch (err: any) {
    console.warn('Firestore updateDoc status sync fallback:', err.message);
  }
}
