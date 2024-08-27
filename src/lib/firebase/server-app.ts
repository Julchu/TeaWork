// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';

import { headers } from 'next/headers';
import { initializeServerApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';
import { getInstallations } from 'firebase/installations';
import { getFirestore } from 'firebase/firestore';

export const getFirebaseServerApp = async () => {
  const authIdToken = headers().get('Authorization')?.split('Bearer ')[1];

  const app = initializeServerApp(
    firebaseConfig,
    authIdToken
      ? {
          authIdToken,
        }
      : {},
  );
  const firestore = getFirestore(app);
  const installations = getInstallations(app);
  const authentication = getAuth(app);
  await authentication.authStateReady();

  return {
    app,
    firestore,
    installations,
    authentication,
    currentUser: authentication.currentUser,
  };
};