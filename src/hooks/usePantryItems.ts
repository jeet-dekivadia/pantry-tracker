import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PantryItem } from '../types';
import { useAuth } from './useAuth';

export function usePantryItems() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'pantryItems'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const pantryItems: PantryItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as PantryItem));
        setItems(pantryItems);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error: ", err);
        setError("Failed to fetch pantry items. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { items, loading, error };
}
