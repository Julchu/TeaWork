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
import { User } from 'firebase/auth';
import { authentication } from 'src/lib/firebase/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserInfo } from 'src/lib/firebase/interfaces';
import useUserHook from 'src/hooks/use-user-firestore-hook';

export const AuthContext = createContext<AuthProps>({
  userInfo: {},
  setUserInfo: () => void 0,
  userLoading: false,
  setUserLoading: () => void 0,
});

type AuthProps = {
  authUser?: User | null;
  authLoading?: boolean;
  authError?: Error | null;

  userInfo: Partial<UserInfo | undefined>;
  setUserInfo: Dispatch<SetStateAction<Partial<UserInfo | undefined>>>;
  userLoading: boolean;
  setUserLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, authLoading, authError] = useAuthState(authentication);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [{ getUser }] = useUserHook();

  const getUserInfo = useCallback(async () => {
    setUserLoading(true);
    const userSnapshot = await getUser(authUser);
    setUserInfo({
      ...userSnapshot?.data(),
    });
  }, [authUser, getUser]);

  // Sets user object on auth changes (login/logout, page refresh)
  useEffect(() => {
    getUserInfo().then(() => {
      setUserLoading(false);
    });
  }, [authUser, getUser, getUserInfo]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        authLoading,
        authError,
        userInfo,
        setUserInfo,
        userLoading,
        setUserLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;