import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import { getInstallations, getToken } from 'firebase/installations';

// this is set during install
let firebaseConfig: FirebaseOptions;

self.addEventListener('install', () => {
  // extract firebase config from query string
  const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');

  if (!serializedFirebaseConfig) {
    throw new Error('Firebase Config object not found in service worker query string.');
  }

  firebaseConfig = JSON.parse(serializedFirebaseConfig);
});

self.addEventListener('fetch', async event => {
  const fetchEvent = event as FetchEvent;

  const { origin } = new URL(fetchEvent.request.url);
  if (origin !== self.location.origin) return;
  try {
    const response = await fetchWithFirebaseHeaders(fetchEvent.request);
    if (response) fetchEvent.respondWith(response);
  } catch (error) {
    console.error('Error in auth-service-worker', error);
  }
});

const fetchWithFirebaseHeaders = async (request: Request) => {
  const headers = new Headers(request.headers);

  const app = initializeApp(firebaseConfig);
  const authentication = getAuth(app);
  const installations = getInstallations(app);

  try {
    const [authIdToken, installationToken] = await Promise.all([
      getAuthIdToken(authentication),
      getToken(installations),
    ]);

    headers.append('Firebase-Instance-ID-Token', installationToken);
    headers.append('Authorization', `Bearer ${authIdToken}`);
    const newRequest = new Request(request, { headers });
    return await fetch(newRequest);
  } catch (error) {
    console.error('Error in auth-service-worker fetchWithFirebaseHeaders', error);
  }
};

async function getAuthIdToken(auth: Auth) {
  await auth.authStateReady();
  if (!auth.currentUser) return;
  return await getIdToken(auth.currentUser);
}