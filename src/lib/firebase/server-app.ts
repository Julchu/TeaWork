// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';

import { headers } from 'next/headers';
import { initializeServerApp } from '@firebase/app';
import { firebaseConfig } from 'src/lib/firebase/firebase-config';
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore';
import { connectAuthEmulator, getAuth } from '@firebase/auth';
import process from 'process';

let emulatorsStarted = false;

export const getFirebaseServerApp = async () => {
  try {
    const authIdToken = headers().get('Authorization')?.split('Bearer ')[1];

    if (authIdToken) {
      const app = initializeServerApp(firebaseConfig, {
        authIdToken,
      });
      const firestore = getFirestore(app);
      const authentication = getAuth(app);

      await authentication.authStateReady();

      if (
        process.env.NEXT_PUBLIC_EMULATOR_ENABLED &&
        process.env.NEXT_PUBLIC_LAN &&
        !emulatorsStarted
      ) {
        connectAuthEmulator(authentication, `http://${process.env.NEXT_PUBLIC_LAN}:9099`, {
          disableWarnings: true,
        });
        connectFirestoreEmulator(firestore, process.env.NEXT_PUBLIC_LAN, 8080);
        emulatorsStarted = true;
      }

      if (authentication.currentUser) {
        return {
          app,
          currentUser: authentication.currentUser,
        };
      }
    }
  } catch (error) {
    console.log('Error in server-app', error);
  }
  return {
    app: undefined,
    currentUser: undefined,
  };
};