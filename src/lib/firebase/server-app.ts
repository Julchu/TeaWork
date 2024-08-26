// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';

import { headers } from 'next/headers';
import { initializeServerApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';
import { getInstallations } from 'firebase/installations';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore';

const setupEmulators = async (authentication: Auth, firestore: Firestore) => {
  if (process.env.NEXT_PUBLIC_EMULATOR_ENABLED && process.env.NEXT_PUBLIC_LAN) {
    connectFirestoreEmulator(firestore, process.env.NEXT_PUBLIC_LAN, 8080);
    connectAuthEmulator(authentication, `http://${process.env.NEXT_PUBLIC_LAN}:9099`, {
      disableWarnings: true,
    });
  }
};

export const getAuthenticatedAppForUser = async () => {
  const authIdToken = headers().get('Authorization')?.split('Bearer ')[1];

  console.log('authIdToken', authIdToken);
  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    authIdToken
      ? {
          authIdToken: authIdToken,
        }
      : {},
  );

  const authentication = getAuth(firebaseServerApp);
  await authentication.authStateReady();

  const firestore = getFirestore(firebaseServerApp);
  const installations = getInstallations(firebaseServerApp);
  setupEmulators(authentication, firestore);

  return {
    firebaseServerApp,
    firestore,
    installations,
    authentication,
    currentUser: authentication.currentUser,
  };
};
