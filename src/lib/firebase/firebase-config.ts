// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from 'firebase/analytics';
import { connectFirestoreEmulator, getFirestore } from "@firebase/firestore";
import { connectAuthEmulator, getAuth } from "@firebase/auth";
import * as process from "process";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
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