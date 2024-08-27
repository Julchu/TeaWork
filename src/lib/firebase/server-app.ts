// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';

import { headers } from 'next/headers';
import { FirebaseServerApp, initializeServerApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

export const getFirebaseServerApp = async () => {
  const authIdToken = headers().get('Authorization')?.split('Bearer ')[1];

  try {
    const app = initializeServerApp(
      firebaseConfig,
      authIdToken
        ? {
            authIdToken,
          }
        : {},
    );
    const authentication = getAuth(app);
    await authentication.authStateReady();

    return {
      app,
      currentUser: authentication.currentUser,
    };
  } catch (error) {
    console.log(error);
  }
  return {
    app: null as unknown as FirebaseServerApp,
    currentUser: undefined as unknown as User,
  };
};