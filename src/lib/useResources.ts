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
};

/**
 * Real-time listener hook — subscribes to Firestore 'resources' collection
 * and returns live data as it changes.
 */
export function useResources() {
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: ResourceEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ResourceEntry, 'id'>),
          createdAt: doc.data().createdAt?.toDate() ?? null,
        }));
        setResources(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Failed to load live data. Check your Firebase configuration.');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { resources, loading, error };
}

/**
 * Submit a new resource survey entry to Firestore.
 */
export async function submitResource(data: Omit<ResourceEntry, 'id' | 'createdAt' | 'status'>) {
  await addDoc(collection(db, 'resources'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
