import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import { getInstallations, getToken } from 'firebase/installations';

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
  const { origin } = new URL((event as FetchEvent).request.url);
  if (origin !== self.location.origin) return;
  (event as FetchEvent).respondWith(fetchWithFirebaseHeaders((event as FetchEvent).request));
});

const fetchWithFirebaseHeaders = async (request: Request) => {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const installations = getInstallations(app);
  const headers = new Headers(request.headers);
  const [authIdToken, installationToken] = await Promise.all([
    getAuthIdToken(auth),
    getToken(installations),
  ]);
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
