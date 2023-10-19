'use client';
import { createContext, FC, ReactNode, useContext } from 'react';
import { User } from 'firebase/auth';
import { authentication } from 'src/lib/firebase/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';

export const AuthContext = createContext<AuthProps>({});

type AuthProps = {
  authUser?: User | null;
  userLoading?: boolean;
  userError?: Error;
};

export const useAuthContext = (): AuthProps => useContext(AuthContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, userLoading, userError] = useAuthState(authentication);
  const [authUser, userLoading, userError] = useAuthState(authentication, {
    onUserChanged: async userCredentials => {
      if (!userCredentials) {
        const response = await fetch('/api/signOut', {
          method: 'POST',
        });

        if (response.status === 200) {
          console.log('not logged in');
        }
      } else {
        fetch('/api/login', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await userCredentials.getIdToken()}`,
          },
        }).then(async response => {
          console.log(await userCredentials.getIdToken());
          console.log('response', response);
        });
      }
    },
  });

  return (
    <AuthContext.Provider value={{ authUser, userLoading, userError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;