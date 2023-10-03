'use client';
import { FC, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase/setup';
import Login from 'src/components/auth/login';
import Signout from 'src/components/auth/sign-out';

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, loading, error] = useAuthState(authentication);

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Signout />
      {children}
    </>
  );
};

export default AuthProvider;