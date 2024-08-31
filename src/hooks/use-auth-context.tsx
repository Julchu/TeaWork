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
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { UserInfo } from 'src/lib/firebase/interfaces';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import { authentication } from 'src/lib/firebase/client-app';
import { useRouter } from 'next/navigation';
import { deleteCookies, setCookies } from 'src/app/get/actions';

export const AuthContext = createContext<AuthProps>({
  userInfo: {},
  setUserInfo: () => void 0,
  userLoading: false,
  setUserLoading: () => void 0,
  login: () => void 0,
  logout: () => void 0,
});

type AuthProps = {
  authUser?: User | null;
  authLoading?: boolean;
  login: () => void;
  logout: () => void;

  userInfo: Partial<UserInfo | undefined>;
  setUserInfo: Dispatch<SetStateAction<Partial<UserInfo | undefined>>>;
  userLoading: boolean;
  setUserLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode; currentEmail?: string }> = ({
  children,
  currentEmail,
}) => {
  const [authUser, setAuthUser] = useState<User | undefined>(undefined);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [{ getUser }] = useUserHook();

  const router = useRouter();

  const login = useCallback(async () => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    await signInWithPopup(authentication, provider); // signInWithRedirect(auth, provider) doesn't work for mobile for now
  }, []);

  const logout = useCallback(() => {
    authentication
      .signOut()
      .then(async () => {
        // Sign-out successful.
        setAuthUser(undefined);
        await deleteCookies(['__session']);

        console.log('Signed out');
      })
      .catch(error => {
        // An error happened.
        console.log('Sign out error:', error);
      });

    router.refresh();
    setAuthLoading(false);
  }, [router]);

  const handleAuthChange = useCallback(
    async (firebaseUser: User | null) => {
      console.log('firebaseUser', firebaseUser);
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        await setCookies([{ key: '__session', value: await firebaseUser.getIdToken() }]);
        router.refresh();

        const retrievedUser = await getUser(firebaseUser);
        if (retrievedUser) {
          setUserInfo({ ...retrievedUser?.data() });
        }
        router.refresh();
      } /* else {
        setAuthUser(undefined);
        setUserInfo({});
        await deleteCookies(['__session']);
        console.log('User is not logged');
      }*/
      router.refresh();
      setAuthLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Auth persistence: detect if user is authenticated or not (on page change, on page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authentication, handleAuthChange);
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onAuthStateChanged(authentication, async firebaseUser => {
      if (authUser === undefined) return;

      if (authUser?.email !== firebaseUser?.email) {
        await deleteCookies(['__session']);
        router.refresh();
        console.log('Not logged in');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
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