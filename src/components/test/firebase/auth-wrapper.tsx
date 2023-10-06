'use client';
import { FC, ReactNode } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) return null;
  return <div>{children}</div>;
};

export default AuthWrapper;