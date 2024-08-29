import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import { getInstallations, getToken } from 'firebase/installations';
import { getApps } from '@firebase/app';

// this is set during install
let firebaseConfig: FirebaseOptions;

self.addEventListener('install', () => {
  // Extract firebase config from query string
  const searchParams = new URL(location.href).searchParams;
  const serializedFirebaseConfig = searchParams.get('firebaseConfig');

  if (!serializedFirebaseConfig) {
    throw new Error('Firebase Config object not found in service worker query string.');
  }

  firebaseConfig = JSON.parse(serializedFirebaseConfig);
});

self.addEventListener('fetch', event => {
  const fetchEvent = event as FetchEvent;

  const { origin } = new URL(fetchEvent.request.url);
  if (origin !== self.location.origin) return;
  try {
    fetchEvent.respondWith(fetchWithFirebaseHeaders(fetchEvent.request));
  } catch (error) {
    console.error('Error in auth-service-worker', error);
  }
});

const fetchWithFirebaseHeaders = async (request: Request) => {
  const headers = new Headers(request.headers);

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const authentication = getAuth(app);
  const installations = getInstallations(app);

  const [authIdToken, installationToken] = await Promise.all([
    getAuthIdToken(authentication),
    getToken(installations),
  ]);

  headers.append('Firebase-Instance-ID-Token', installationToken);
  headers.append('Authorization', `Bearer ${authIdToken}`);
  console.log('authIdToken', authIdToken);
  const newRequest = new Request(request, { headers });
  return await fetch(newRequest);
};

async function getAuthIdToken(auth: Auth) {
  await auth.authStateReady();
  if (!auth.currentUser) return;
  return await getIdToken(auth.currentUser);
}