import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import { getInstallations, getToken } from 'firebase/installations';
import { connectAuthEmulator } from '@firebase/auth';

// this is set during install
let firebaseConfig: FirebaseOptions;

self.addEventListener('install', event => {
  // extract firebase config from query string
  const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');

  if (!serializedFirebaseConfig) {
    throw new Error('Firebase Config object not found in service worker query string.');
  }

  firebaseConfig = JSON.parse(serializedFirebaseConfig);
  console.log('Service worker installed with Firebase config', firebaseConfig);
});

self.addEventListener('fetch', event => {
  const fetchEvent = event as FetchEvent;

  const { origin } = new URL(fetchEvent.request.url);
  if (origin !== self.location.origin) return;
  fetchEvent.respondWith(fetchWithFirebaseHeaders(fetchEvent.request));
});

const fetchWithFirebaseHeaders = async (request: Request) => {
  const app = initializeApp(firebaseConfig);
  const authentication = getAuth(app);
  connectAuthEmulator(authentication, `http://localhost:9099`, {
    disableWarnings: true,
  });
  const installations = getInstallations(app);

  const [authIdToken, installationToken] = await Promise.all([
    getAuthIdToken(authentication),
    getToken(installations),
  ]);

  const headers = new Headers(request.headers);
  headers.append('Firebase-Instance-ID-Token', installationToken);
  if (authIdToken) headers.append('Authorization', `Bearer ${authIdToken}`);
  const newRequest = new Request(request, { headers });
  return await fetch(newRequest);
};

async function getAuthIdToken(auth: Auth) {
  await auth.authStateReady();
  if (!auth.currentUser) return;
  return await getIdToken(auth.currentUser);
}