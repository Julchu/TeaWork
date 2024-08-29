import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import { getInstallations, getToken } from 'firebase/installations';
import { connectAuthEmulator } from '@firebase/auth';
import { getApps } from '@firebase/app';

// this is set during install
let firebaseConfig: FirebaseOptions;
let lan = '';
let emulatorsStarted = false;

self.addEventListener('install', () => {
  // Extract firebase config from query string
  const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');
  lan = new URL(location.href).searchParams.get('lan') || '';

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
  try {
    const headers = new Headers(request.headers);

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const authentication = getAuth(app);

    if (!emulatorsStarted) {
      connectAuthEmulator(authentication, `http://${lan}:9099`, {
        disableWarnings: true,
      });
      emulatorsStarted = true;
    }

    const installations = getInstallations(app);

    const [authIdToken, installationToken] = await Promise.all([
      getAuthIdToken(authentication),
      getToken(installations, true),
    ]);

    headers.append('Firebase-Instance-ID-Token', installationToken);
    headers.append('Authorization', `Bearer ${authIdToken}`);
    const newRequest = new Request(request, { headers });
    return await fetch(newRequest);
  } catch (error) {
    console.log('Error in auth service worker', error);
  }
  return await fetch('');
};

async function getAuthIdToken(auth: Auth) {
  await auth.authStateReady();
  if (!auth.currentUser) return;
  return await getIdToken(auth.currentUser, true);
}