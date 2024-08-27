import React, { FC, ReactNode } from 'react';
import AuthProvider from 'src/hooks/use-auth-context';
import AuthWrapper from 'src/components/auth/auth-wrapper';

const Providers: FC<{ children: ReactNode; currentUser: any }> = ({ children, currentUser }) => {
  return (
    <AuthProvider currentUser={currentUser}>
      <AuthWrapper currentUser={currentUser}>{children}</AuthWrapper>
    </AuthProvider>
  );
};

export default Providers;