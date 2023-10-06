import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from '@firebase/auth';

import { db, User, WithDocId } from '../lib/firebase/interfaces';
import { useRouter } from 'next/router';
import useUserHook from './use-user-hook';
import { doc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext<AuthContextType>({
  authUser: undefined,
  authLoading: false,
  login: () => void 0,
  logout: () => void 0,
});

type AuthContextType = {
  authUser: WithDocId<User> | undefined;
  authLoading: boolean;
  login: () => void;
  logout: () => void;
};

// Public auth hook
export const oldUseAuthContext = (): AuthContextType => useContext(AuthContext);

// Initial values of Auth Context (AuthContextType)
export const useProvideAuth = (): AuthContextType => {
  const { setColorMode } = useColorMode();
  const [authUser, setAuthUser] = useState<WithDocId<User> | undefined>(undefined);
  const [{ retrieveUser }, _updatedUser, _createUserLoading] = useUserHook();
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const router = useRouter();
  const auth = getAuth();

  const login = useCallback(() => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Retrieve user public info such as first name
    // provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    // provider.addScope('profile');
    // provider.addScope('email');

    signInWithPopup(auth, provider); // signInWithRedirect(auth, provider) doesn't work for mobile for now
  }, [auth]);

  const logout = useCallback(() => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setAuthUser(undefined);
        console.log('Signed out');
        router.push('/');
      })
      .catch(error => {
        // An error happened.
        console.log('Sign out error:', error);
      });
    setAuthLoading(false);
  }, [auth, router]);

  /* Every page load, checks if there is a user authenticated from Google services (not Pricey db)
   * If there is one (aka after signing in), go to handleRedirect to getRedirectResults
   * If user had redirected from Google login services, there will be a redirectResult: get/create user
   * If user refreshes page, there will be no redirect result: get user
   */
  const handleAuthChange = useCallback(
    async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const retrievedUser = await retrieveUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
        });

        if (retrievedUser) setAuthUser(retrievedUser);
      } else {
        setAuthUser(undefined);
        console.log('User is not logged');
      }
      setAuthLoading(false);
    },
    [retrieveUser],
  );

  // Check for any db change in user's document and update authUser
  useEffect(() => {
    if (!authUser?.documentId) return;
    const unsubscribe = onSnapshot(doc(db.userCollection, authUser?.documentId), querySnapshot => {
      const user = querySnapshot.data();
      if (user) {
        setAuthUser(prev =>
          prev
            ? {
                ...prev,
                documentId: querySnapshot.id,
                uid: user.uid,
                email: user.email,
                photoURL: user.photoURL,
                name: user.name,
                location: user.location,
                role: user.role,
                preferences: user.preferences,
              }
            : undefined,
        );
        setColorMode(user.preferences?.colorMode || 'light');
      }
    });

    return () => unsubscribe();
  }, [authUser?.documentId, setColorMode]);

  // Auth persistence: detect if user is authenticated or not (on page change, on page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
    return () => unsubscribe();
  }, [auth, handleAuthChange]);

  return { authUser, authLoading, login, logout };
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthContext.Provider value={useProvideAuth()}>{children}</AuthContext.Provider>;
};

/* Use this (getRedirectResult) if using signInWithRedirect? */
// const handleRedirect = useCallback(
//   async (auth: Auth, user: FirebaseUser | null): Promise<User | void> => {
//     return await getRedirectResult(auth)
//       .then(async result => {
//         // If user refreshes page, there will be no redirect result since it's not coming from signInWithRedirect
//         if (result) {
//           // This gives you a Google Access Token. You can use it to access Google APIs.
//           const credential = GoogleAuthProvider.credentialFromResult(result);
//           const _token = credential?.accessToken;
//           const user = result.user;

//           return (
//             (await getUser(user.uid)) ||
//             (await createUser({
//               uid: user.uid,
//               email: user.email || '',
//               photoURL: user.photoURL || '',
//               displayName: user.displayName || '',
//             }))
//           );
//         } else if (user)
//           return (
//             (await getUser(user.uid)) ||
//             (await createUser({
//               uid: user.uid,
//               email: user.email || '',
//               photoURL: user.photoURL || '',
//               displayName: user.displayName || '',
//             }))
//           );
//       })
//       .catch(error => {
//         // Handle Errors here.
//         console.error(error);
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         // The email of the user's account used.
//         const email = error.customData.email;
//         // The AuthCredential type that was used.
//         const credential = GoogleAuthProvider.credentialFromError(error);
//         console.error(errorCode, errorMessage, email, credential);
//       });
//   },
//   [createUser, getUser],
// );