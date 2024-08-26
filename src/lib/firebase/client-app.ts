// Import the functions you need from the SDKs you need
// import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
import { getApps, initializeApp } from '@firebase/app';
import { firebaseConfig } from 'src/lib/firebase/firebase-config';
import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore';
import { connectAuthEmulator, getAuth } from '@firebase/auth';
import * as process from 'process';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// const analytics = getAnalytics(app);
// const storage = getStorage(app);

const firestore = getFirestore(app);
const authentication = getAuth(app);

if (process.env.NEXT_PUBLIC_EMULATOR_ENABLED && process.env.NEXT_PUBLIC_LAN) {
  connectFirestoreEmulator(firestore, process.env.NEXT_PUBLIC_LAN, 8080);
  connectAuthEmulator(authentication, `http://${process.env.NEXT_PUBLIC_LAN}:9099`, {
    disableWarnings: true,
  });
}
export { firestore, authentication };
