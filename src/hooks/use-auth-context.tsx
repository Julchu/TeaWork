'use client';
import { FC, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase';
import Login from 'src/components/auth/login';
import SignOut from 'src/components/auth/sign-out';

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, loading, error] = useAuthState(authentication);

  return (
    <>
      {user ? <SignOut /> : <Login />}
      {children}
    </>
  );
};

export default AuthProvider;