import { db } from "src/lib/firebase/interfaces/generics";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Using React Firebase Hooks to retrieve real-time collection of documents data
export const useGetReactFirebaseHookData = () => {
  const ref = db.userCollection;

  const [data, loading, error] = useCollectionData(ref);

  return { data, loading, error };
};