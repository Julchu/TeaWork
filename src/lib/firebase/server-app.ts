// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';

import { cookies } from 'next/headers';
import { initializeServerApp } from '@firebase/app';
import { firebaseConfig } from 'src/lib/firebase/firebase-config';
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore';
import { connectAuthEmulator, getAuth } from '@firebase/auth';

let emulatorStarted = false;
export const getFirebaseServerApp = async () => {
  try {
    const authIdToken = cookies().get('__session')?.value;

    // console.log('server app authIdToken: ', authIdToken);
    if (authIdToken) {
      const app = initializeServerApp(firebaseConfig, {
        authIdToken,
      });
      const firestore = getFirestore(app);
      const authentication = getAuth(app);

      if (process.env.NEXT_PUBLIC_LAN && !emulatorStarted) {
        connectAuthEmulator(authentication, `http://${process.env.NEXT_PUBLIC_LAN}:9099`, {
          disableWarnings: true,
        });
        connectFirestoreEmulator(firestore, process.env.NEXT_PUBLIC_LAN, 8080);
        emulatorStarted = true;
      }

      await authentication.authStateReady();

      return {
        app,
        currentUser: authentication.currentUser,
        firestore,
      };
    }
  } catch (error) {
    console.log('Error in server-app', error);
  }
  return {
    app: undefined,
    currentUser: undefined,
    firestore: undefined,
  };
};