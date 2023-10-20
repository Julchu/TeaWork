'use client';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { User } from 'firebase/auth';
import { authentication } from 'src/lib/firebase/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserInfo } from 'src/lib/firebase/interfaces/generics';
import useUserHook from 'src/hooks/use-user-firestore-hook';

export const AuthContext = createContext<AuthProps>({
  setUserInfo: () => void 0,
  userLoading: false,
});

type AuthProps = {
  authUser?: User | null;
  userInfo?: Partial<UserInfo | undefined>;
  setUserInfo: Dispatch<SetStateAction<Partial<UserInfo | undefined>>>;
  userLoading: boolean;
  userError?: Error | null;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [{ getUser }] = useUserHook();
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [authUser, userLoading, userError] = useAuthState(authentication, {
    onUserChanged: async userCredentials => {
      if (userCredentials) {
        getUser().then(userSnapshot => {
          setUserInfo(userSnapshot?.data());
        });
      } else {
        setUserInfo({});
      }
    },
  });

  return (
    <AuthContext.Provider value={{ authUser, userLoading, userError, userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;