import { db } from 'src/lib/firebase/interfaces';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Using React Firebase Hooks to retrieve real-time collection of documents data
export const useGetReactFirebaseHookData = () => {
  const [data, loading, error] = useCollectionData(db.userCollection);

  return { data, loading, error };
};
