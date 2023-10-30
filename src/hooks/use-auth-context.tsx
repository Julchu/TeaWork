'use client';
import { createContext, FC, ReactNode, useContext } from 'react';
import { User } from 'firebase/auth';
import { authentication } from 'src/lib/firebase/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';

export const AuthContext = createContext<AuthProps>({});

type AuthProps = {
  authUser?: User | null;
  authLoading?: boolean;
  authError?: Error | null;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, authLoading, authError] = useAuthState(authentication);

  return (
    <AuthContext.Provider value={{ authUser, authLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
