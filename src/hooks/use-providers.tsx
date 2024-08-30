import React, { FC, ReactNode } from 'react';
import AuthProvider from 'src/hooks/use-auth-context';
import AuthWrapper from 'src/components/auth/auth-wrapper';
import { User } from 'firebase/auth';

const Providers: FC<{ children: ReactNode; currentUser?: User }> = ({ children, currentUser }) => {
  return (
    <AuthProvider currentUser={currentUser}>
      <AuthWrapper>{children}</AuthWrapper>
    </AuthProvider>
  );
};

export default Providers;