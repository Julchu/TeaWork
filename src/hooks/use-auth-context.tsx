'use client';
import { createContext, FC, ReactNode, useContext } from 'react';
import SignOut from 'src/components/auth/sign-out';
import { User } from 'firebase/auth';
import Login from 'src/components/auth/login';
import { authentication } from 'src/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const AuthContext = createContext<AuthProps>({});

type AuthProps = { user?: User | null };

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useAuthState(authentication);

  return (
    <AuthContext.Provider value={{ user }}>
      {user ? <SignOut /> : <Login />}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;