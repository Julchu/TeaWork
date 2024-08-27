'use client';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { UserInfo } from 'src/lib/firebase/interfaces';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import { authentication } from 'src/lib/firebase/client-app';
import { useRouter } from 'next/navigation';
import { firebaseConfig } from 'src/lib/firebase/firebase-config';

export const AuthContext = createContext<AuthProps>({
  userInfo: {},
  testCurrentUser: {},
  setUserInfo: () => void 0,
  userLoading: false,
  setUserLoading: () => void 0,
  login: () => void 0,
  logout: () => void 0,
});

type AuthProps = {
  authUser?: User | null;
  testCurrentUser: any;
  authLoading?: boolean;
  login: () => void;
  logout: () => void;

  userInfo: Partial<UserInfo | undefined>;
  setUserInfo: Dispatch<SetStateAction<Partial<UserInfo | undefined>>>;
  userLoading: boolean;
  setUserLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode; currentUser: any }> = ({ children, currentUser }) => {
  const [authUser, setAuthUser] = useState<User | undefined>(undefined);
  const [testCurrentUser, setTestCurrentUser] = useState<any>(currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [{ getUser }] = useUserHook();

  const router = useRouter();

  const login = useCallback(async () => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Retrieve user public info such as first name
    // provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    // provider.addScope('profile');
    // provider.addScope('email');

    await signInWithPopup(authentication, provider); // signInWithRedirect(auth, provider) doesn't work for mobile for now
  }, []);

  const logout = useCallback(() => {
    signOut(authentication)
      .then(async () => {
        // Sign-out successful.
        setAuthUser(undefined);
        // await deleteCookies(['token']);
        console.log('Signed out');
        // router.push('/');
      })
      .catch(error => {
        // An error happened.
        console.log('Sign out error:', error);
      });
    setAuthLoading(false);
  }, []);

  const handleAuthChange = useCallback(
    async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const retrievedUser = await getUser(firebaseUser);

        if (retrievedUser) {
          setAuthUser(firebaseUser);
          setUserInfo({ ...retrievedUser?.data() });
          // await setCookies([{ key: 'token', value: await firebaseUser.getIdToken() }]);
        }
      } else {
        setAuthUser(undefined);
        setUserInfo({});
        // await deleteCookies(['token']);
        console.log('User is not logged');
      }
      setAuthLoading(false);
    },
    [getUser],
  );

  useEffect(() => {
    onAuthStateChanged(authentication, firebaseUser => {
      if (authUser === undefined) return;

      // refresh when user changed to ease testing
      if (authUser?.email !== firebaseUser?.email) {
        router.refresh();
      }
    });
  }, [authUser, router]);

  // Auth persistence: detect if user is authenticated or not (on page change, on page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authentication, handleAuthChange);
    return () => unsubscribe();
  }, [handleAuthChange]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const serializedFirebaseConfig = encodeURIComponent(JSON.stringify(firebaseConfig));
      const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`;

      navigator.serviceWorker.register(serviceWorkerUrl, { scope: '/' });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        testCurrentUser,
        authLoading,
        userInfo,
        setUserInfo,
        userLoading,
        setUserLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;