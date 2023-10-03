import {
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db, Role, Unit, User, WithDocId } from '../lib/firebase/interfaces';
import { filterNullableObject } from '../lib/functions';
import { useAuthContext } from './use-auth-context';

type AuthData = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role?: Role;
};

interface UseUserMethods {
  getUser: (docId: string) => Promise<WithDocId<User> | undefined | void>;
  retrieveUser: (authData: AuthData) => Promise<WithDocId<User> | undefined | void>;
  updateUser: (userData: Partial<WithDocId<User>>) => Promise<WithDocId<User> | undefined | void>;
}

const useUserHook = (): [UseUserMethods, boolean, Error | undefined] => {
  const [error, setError] = useState<Error>();
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const { authUser } = useAuthContext();

  const getUser = useCallback<UseUserMethods['getUser']>(async docId => {
    setUserLoading(true);
    try {
      // Associate auth info to a specific user in db for public data:
      const existingUser = await getDoc(doc(db.userCollection, docId));
      if (existingUser.exists()) {
        setUserLoading(false);
        return { ...existingUser.data(), documentId: existingUser.id };
      }
    } catch (error) {
      setError(error as Error);
    }
  }, []);

  const retrieveUser = useCallback<UseUserMethods['retrieveUser']>(
    async ({ uid, displayName, email, photoURL, role = Role.standard }) => {
      try {
        setUserLoading(true);
        // Associate auth info to a specific user in db for public data:
        const q = query(db.userCollection, where('uid', '==', uid));
        const existingUser = await getDocs(q);

        if (existingUser.size > 0) {
          const user = existingUser.docs[0].data();
          return { documentId: existingUser.docs[0].id, ...user };
        } else {
          // Create new user if user doesn't exist
          const newUserDocRef = doc(db.userCollection);
          await setDoc(newUserDocRef, {
            uid,
            email,
            photoURL,
            name: displayName,
            createdAt: serverTimestamp(),
            role,
            preferences: { units: { mass: Unit.kilogram, volume: Unit.litre } },
          });
          const newUserDoc = await getDoc(newUserDocRef);
          if (newUserDoc.exists()) {
            const user = newUserDoc.data();
            setUserLoading(false);
            return {
              documentId: newUserDoc.id,
              ...user,
            };
          }
        }
      } catch (error) {
        setError(error as Error);
      }
    },
    [],
  );

  // Ex: await updateUser({ mass: Unit.kilogram, volume: Unit.litre } as Partial<WithId<User>>
  // Be sure to pass user's documentId in userData
  const updateUser = useCallback<UseUserMethods['updateUser']>(
    async userData => {
      setUserLoading(true);
      const updatedInfo = filterNullableObject(userData);

      try {
        // Associate auth info to a specific user in db for public data:
        const userDocRef = doc(db.userCollection, authUser?.documentId);
        await updateDoc(userDocRef, updatedInfo);
        const updatedUser = await getDoc(userDocRef);

        if (updatedUser.exists()) {
          setUserLoading(false);
          return {
            documentId: updatedUser.id,
            ...updatedUser.data(),
          };
        }
      } catch (error) {
        setError(error as Error);
      }
    },
    [authUser?.documentId],
  );

  return [
    {
      getUser,
      retrieveUser,
      updateUser,
    },
    userLoading,
    error,
  ];
};

export default useUserHook;
