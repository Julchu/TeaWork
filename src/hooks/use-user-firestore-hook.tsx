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
import { Coordinates, db, MapStyle, UserInfo } from 'src/lib/firebase/interfaces';
import { filterNullableObject } from 'src/lib/functions';
import { User } from 'firebase/auth';

export type UserFormData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  lastLocation?: Coordinates;
  performanceMode?: boolean;
  mapStyle?: MapStyle;
};

type UserMethods = {
  addUser: (userData: UserFormData) => Promise<DocumentReference<UserInfo> | undefined>;
  getUser: (authUser: User | null | undefined) => Promise<DocumentSnapshot<UserInfo> | undefined>;
  updateUser: (userData: Partial<UserFormData>) => Promise<DocumentReference<UserInfo> | undefined>;
};

const useUserHook = (): [UserMethods, boolean, Error | undefined] => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();
  const { authUser, setUserInfo } = useAuthContext();

  const getUser = useCallback<UserMethods['getUser']>(async authUser => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    let userDocRef = await getDoc(db.userDoc(authUser.uid));

    try {
      if (!userDocRef.exists()) {
        const displayName = authUser.displayName?.split(' ');
        const newUser: UserInfo = {
          email: authUser.email ? authUser.email : '',
          firstName: displayName ? displayName[0] : '',
          lastName: displayName && displayName.length > 1 ? displayName[1] : '',
          createdAt: serverTimestamp(),
        };
        await setDoc(db.userDoc(authUser.uid), newUser);
        userDocRef = await getDoc(db.userDoc(authUser.uid));
      }
    } catch (e) {
      setError(e as Error);
    }

    setLoading(false);
    return userDocRef;
  }, []);

  const addUser = useCallback<UserMethods['addUser']>(
    async ({ firstName, lastName, email, lastLocation }) => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Creating doc with auto-generated id
      const userDocRef = db.userDoc(authUser.uid);

      try {
        if (email && firstName && lastName) {
          // Ensuring all fields are passed by typechecking Ingredient
          const newUser: UserInfo = {
            email,
            firstName,
            lastName,
            lastLocation: lastLocation,
            createdAt: serverTimestamp(),
          };
          /* If you want to auto generate an ID, use addDoc() + collection()
           * If you want to manually set the ID, use setDoc() + doc()
           */
          await setDoc(userDocRef, newUser);
        }
      } catch (e) {
        setError(e as Error);
      }

      setLoading(false);
      return userDocRef;
    },
    [authUser, setLoading],
  );

  const updateUser = useCallback<UserMethods['updateUser']>(
    async ({ firstName, lastName, email, lastLocation, performanceMode, mapStyle }) => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      const userDocRef = db.userDoc(authUser.uid);

      const updatedUser: Partial<UserInfo> = filterNullableObject({
        firstName,
        lastName,
        email,
        lastLocation,
        performanceMode,
        mapStyle,
      });

      try {
        // updateDoc modifies existing variables and adds non-existing variables, whereas setDoc replaces the entire object
        await updateDoc(userDocRef, updatedUser);
        setUserInfo(currentInfo => ({ ...currentInfo, ...updatedUser }));
      } catch (e) {
        setError(e as Error);
      }

      setLoading(false);
      return userDocRef;
    },
    [authUser, setUserInfo, setLoading],
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