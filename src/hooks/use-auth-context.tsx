'use client';
import { createContext, FC, ReactNode, useContext } from 'react';
import { User } from 'firebase/auth';
import { authentication } from 'src/lib/firebase/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';

export const AuthContext = createContext<AuthProps>({});

type AuthProps = {
  authUser?: User | null;
  userLoading?: boolean;
  userError?: Error | null;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, userLoading, userError] = useAuthState(authentication);

  return (
    <AuthContext.Provider value={{ authUser, userLoading, userError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;