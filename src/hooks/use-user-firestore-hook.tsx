import {
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { db, UserInfo } from 'src/lib/firebase/interfaces/generics';
import { LngLatLike } from 'mapbox-gl';
import { filterNullableObject } from 'src/lib/functions';

export type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  currentLocation?: LngLatLike;
};

type UserMethods = {
  addUser: (userData: UserFormData) => Promise<DocumentReference<UserInfo> | undefined>;
  getUser: (userId: string) => Promise<DocumentSnapshot<UserInfo> | undefined>;
  updateUser: (userData: Partial<UserFormData>) => Promise<DocumentReference<UserInfo> | undefined>;
};

const useUserHook = (): [UserMethods, boolean, Error | undefined] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { user } = useAuthContext();

  const getUser = useCallback<UserMethods['getUser']>(
    async userId => {
      if (!user) return;
      setLoading(true);

      const userDocRef = await getDoc(db.userDoc(userId));

      try {
        if (!userDocRef.exists()) {
          const displayName = user.displayName?.split(' ');
          const newUser: UserInfo = {
            email: user.email ? user.email : '',
            firstName: displayName ? displayName[0] : '',
            lastName: displayName && displayName.length > 1 ? displayName[1] : '',
            firestoreId: user.uid,
            createdAt: serverTimestamp(),
          };
          await setDoc(db.userDoc(user.uid), newUser);
        }
      } catch (e) {
        setError(e as Error);
      }

      setLoading(false);
      return userDocRef;
    },
    [user],
  );

  const addUser = useCallback<UserMethods['addUser']>(
    async ({ firstName, lastName, email, currentLocation }) => {
      if (!user) return;
      setLoading(true);

      // Creating doc with auto-generated id
      const userDocRef = db.userDoc();

      // Ensuring all fields are passed by typechecking Ingredient
      const newUser: UserInfo = {
        email,
        firstName,
        lastName,
        firestoreId: user.uid,
        currentLocation,
        createdAt: serverTimestamp(),
      };

      try {
        /* If you want to auto generate an ID, use addDoc() + collection()
         * If you want to manually set the ID, use setDoc() + doc()
         */
        await setDoc(userDocRef, newUser);
      } catch (e) {
        setError(e as Error);
      }

      setLoading(false);
      return userDocRef;
    },
    [user],
  );

  const updateUser = useCallback<UserMethods['updateUser']>(
    async ({ firstName, lastName, email, currentLocation }) => {
      const userDocRef = db.userDoc();

      const updatedUser: Partial<UserInfo> = filterNullableObject({
        firstName,
        lastName,
        email,
        currentLocation,
      });

      try {
        await updateDoc(userDocRef, updatedUser);
      } catch (e) {
        setError(e as Error);
      }

      return userDocRef;
    },
    [],
  );

  return [{ getUser, addUser, updateUser }, loading, error];
};

export default useUserHook;

// Examples
/* If you want to auto generate an ID, use addDoc() + collection()
 * If you want to manually set the ID, use setDoc() + doc()
 */

/* Add: auto-generate doc and give it ID automatically
 * addDoc(collection requires odd-numbered path)
 * Ex: db, collection: <collectionName>; becomes collectionName/0tG4ooMGjsdiyMfbjP3x
 * Ex: db, collection: <collectionName>, <documentName>, <subCollectionName>; collectionName/0tG4ooMGjsdiyMfbjP3x/strawberry
 */

/* const ingredientsCollectionRef = collection(db, 'ingredients').withConverter(ingredientsConverter);
try {
  const docRef = await addDoc(ingredientsCollectionRef, {
    name,
    price,
    unit,
    location,
  });
  console.log('Document written with ID: ', docRef.id);
} catch (e) {
  setError(e as Error);
}

return ingredientsCollectionRef; */

/* Setting (adding): create or overwrite a single document with manually-named document IDs
 * setDoc(collection requires even-numbered path)
 * Ex: db, collection: <collectionName>, <documentName>
 */

/* const ingredientDocumentRef = doc(db, 'ingredients').withConverter(ingredientsConverter);
try {
  await setDoc(ingredientDocumentRef, {
    name: name.trim().toLocaleLowerCase('en-US'),
    price,
    unit,
    location,
  });
} catch (e) {
  setError(e as Error);
}

return ingredientDocumentRef;

// Setting key as ingredient name, value as the ingredient's name
await setDoc(
  ingredientDocumentRef,
  {
    [`${trimmedName}`]: ingredientInfo,
  },
  { merge: true },
);
*/