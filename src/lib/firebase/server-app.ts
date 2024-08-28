// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';

import { cookies } from 'next/headers';
import { initializeServerApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';
import process from 'process';
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore';
import { connectAuthEmulator } from '@firebase/auth';

export const getFirebaseServerApp = async () => {
  const authIdToken = cookies().get('token')?.value;

  try {
    const app = initializeServerApp(firebaseConfig, {
      authIdToken,
    });
    const authentication = getAuth(app);
    const firestore = getFirestore(app);

    if (authentication.currentUser !== null) {
      return {
        app,
        currentUser: authentication.currentUser,
      };
    }

    if (process.env.NEXT_PUBLIC_EMULATOR_ENABLED && process.env.NEXT_PUBLIC_LAN) {
      connectFirestoreEmulator(firestore, process.env.NEXT_PUBLIC_LAN, 8080);
      connectAuthEmulator(authentication, `http://${process.env.NEXT_PUBLIC_LAN}:9099`, {
        disableWarnings: true,
      });
    }

    await authentication.authStateReady();
  } catch (error) {
    console.log('Error in server-app', error);
  }
  return {
    app: undefined,
    currentUser: undefined,
  };
};