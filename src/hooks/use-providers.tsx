import React, { FC, ReactNode } from 'react';
import AuthProvider from 'src/hooks/use-auth-context';
import Logo from 'src/components/ui/logo';
import AuthWrapper from 'src/components/auth/auth-wrapper';

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <AuthWrapper>{children}</AuthWrapper>
      <Logo />
    </AuthProvider>
  );
};

export default Providers;
