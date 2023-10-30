import React, { FC, ReactNode } from 'react';
import AuthProvider from 'src/hooks/use-auth-context';
import UserProvider from 'src/hooks/use-user-context';
import Logo from 'src/components/ui/logo';
import AuthWrapper from 'src/components/auth/auth-wrapper';

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <AuthWrapper>{children}</AuthWrapper>
        <Logo />
      </UserProvider>
    </AuthProvider>
  );
};

export default Providers;