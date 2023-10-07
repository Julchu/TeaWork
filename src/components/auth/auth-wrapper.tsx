'use client';
import { FC, ReactNode } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import Login from 'src/components/auth/login';

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) return <Login />;
  return <div>{children}</div>;
};

export default AuthWrapper;