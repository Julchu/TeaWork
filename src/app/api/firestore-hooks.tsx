import { onSnapshot, query } from 'firebase/firestore';
import { db, GenericsUser } from 'src/lib/firebase/interfaces/generics';
import { useCallback, useState } from 'react';

export const useStreamAllData = () => {
  const [users, setUsers] = useState<GenericsUser[]>([]);

  const getFirestoreData = useCallback((initialData?: GenericsUser[]) => {
    if (initialData) setUsers(initialData);
    const q = query(db.userCollection);
    const unsubscribe = onSnapshot(q, querySnapshot => {
      setUsers(querySnapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  return { getFirestoreData, users };
};