import { db } from 'src/lib/firebase/interfaces/generics';
import { useCollectionData } from 'react-firebase-hooks/firestore';

export const useGetReactFirebaseHookData = () => {
  const reactFirebaseHookUserCollectionRef = db.userCollection;
  const [reactFirebaseHooksData, reactFirebaseHooksLoading, reactFirebaseHooksError] =
    useCollectionData(reactFirebaseHookUserCollectionRef);

  return { reactFirebaseHooksData, reactFirebaseHooksLoading, reactFirebaseHooksError };
};