import { FC, ReactNode } from 'react';
import AuthProvider from 'src/hooks/use-auth-context';

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Providers;
