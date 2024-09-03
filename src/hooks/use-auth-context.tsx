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
import { deleteCookies, setCookies } from 'src/lib/actions';

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

  const login = async () => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(authentication, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const logout = () => {
    try {
      return authentication.signOut();
    } catch (error) {
      console.error('Error signing out with Google', error);
    }
    setAuthLoading(false);
  };

  const handleAuthChange = useCallback(
    async (firebaseUser: User | null) => {
      if (firebaseUser) {
        setAuthUser(firebaseUser);

        const retrievedUser = await getUser(firebaseUser);
        if (retrievedUser) {
          setUserInfo({ ...retrievedUser?.data() });
          await setCookies([{ key: '__session', value: await firebaseUser.getIdToken() }]);
        }
      } else {
        setAuthUser(undefined);
        setUserInfo({});
        await deleteCookies(['__session']);
        console.log('User is not logged');
      }
      setAuthLoading(false);
    },
    [getUser],
  );

  // Auth persistence: detect if user is authenticated or not (on page change, on page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authentication, handleAuthChange);
    return () => unsubscribe();
  }, [handleAuthChange]);

  useEffect(() => {
    onAuthStateChanged(authentication, firebaseUser => {
      if (authUser === undefined) return;

      if (authUser?.email !== firebaseUser?.email) {
      }
      router.refresh();
    });
  }, [authUser, router]);

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