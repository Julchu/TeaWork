import { onSnapshot, query } from 'firebase/firestore';
import { db, Interfaces } from 'src/lib/firebase/interfaces';
import { useCallback, useState } from 'react';

// Personal implementation to retrieve real-time collection of documents data
export const useStreamAllData = () => {
  const [users, setUsers] = useState<Interfaces[]>([]);

  const getFirestoreData = useCallback(async (initialData?: Interfaces[]) => {
    if (initialData) setUsers(initialData);
    const q = query(db.userCollection);
    const unsubscribe = onSnapshot(q, querySnapshot => {
      setUsers(querySnapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  return { getFirestoreData, users };
};
