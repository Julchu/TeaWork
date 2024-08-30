import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import { getInstallations, getToken } from 'firebase/installations';
import { connectAuthEmulator } from '@firebase/auth';
import { getApps } from '@firebase/app';

// this is set during install
let firebaseConfig: FirebaseOptions;
let lan: string;

const _self = self as unknown as ServiceWorkerGlobalScope;

// Extract firebase config from query string
const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');
lan = new URL(location.href).searchParams.get('lan') || '';

if (!serializedFirebaseConfig) {
  throw new Error('Firebase Config object not found in service worker query string.');
}

firebaseConfig = JSON.parse(serializedFirebaseConfig);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const authentication = getAuth(app);

if (lan) {
  connectAuthEmulator(authentication, `http://${lan}:9099`, {
    disableWarnings: true,
  });
}

console.log(authentication);

const installations = getInstallations(app);

self.addEventListener('fetch', async event => {
  const [authIdToken, installationToken] = await Promise.all([
    getAuthIdToken(authentication),
    getToken(installations, true),
  ]);

  const fetchEvent = event as FetchEvent;

  const { origin, href } = new URL(fetchEvent.request.url);

  if (
    origin !== self.location.origin ||
    !(self.location.protocol === 'https:' || self.location.hostname === 'localhost') ||
    !authIdToken
  )
    return;

  console.log('url2', fetchEvent.request.url);
  console.log('href', href);
  console.log('origin', origin);

  try {
    const response = await fetchWithFirebaseHeaders(fetchEvent, authIdToken, installationToken);
    if (response) fetchEvent.respondWith(response);
  } catch (error) {
    console.error('Error in auth-service-worker', error);
  }
});

const fetchWithFirebaseHeaders = async (
  fetchEvent: FetchEvent,
  authIdToken: string,
  installationToken: string,
) => {
  try {
    const headers = new Headers(fetchEvent.request.headers);

    console.log('auth token', authIdToken);

    headers.append('Firebase-Instance-ID-Token', installationToken);
    headers.append('Authorization', `Bearer ${authIdToken}`);
    const newRequest = new Request(fetchEvent.request, { headers });
    console.log('url', fetchEvent.request.url);
    console.log('new request', newRequest);

    return await fetch(newRequest).catch(async e => {
      console.log('fetch error', e);
    });
  } catch (error) {
    console.log('Error in auth service worker', error);
  }
};

self.addEventListener('activate', event => {
  const fetchEvent = event as FetchEvent;
  // @ts-ignore
  fetchEvent.waitUntil(self.clients.claim());
});

const getAuthIdToken = async (auth: Auth) => {
  await auth.authStateReady();
  if (!auth.currentUser) return;
  return await getIdToken(auth.currentUser, true);
};

// const getBodyContent = (req: Request) => {
//   return Promise.resolve()
//     .then(() => {
//       if (req.method !== 'GET') {
//         const contentType = req.headers.get('Content-Type');
//         if (contentType && contentType.indexOf('json') !== -1) {
//           return req.json().then(json => {
//             return JSON.stringify(json);
//           });
//         } else {
//           return req.text();
//         }
//       }
//     })
//     .catch(error => {
//       // Ignore error.
//     });
// };

// import { getIdToken, onAuthStateChanged } from 'firebase/auth';
// import { getAuth } from '@firebase/auth';
//
// //     const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// const auth = getAuth();
// const getIdTokenPromise = () => {
//   return new Promise((resolve, reject) => {
//     const unsubscribe = onAuthStateChanged(auth, user => {
//       unsubscribe();
//       if (user) {
//         getIdToken(user).then(
//           idToken => {
//             resolve(idToken);
//           },
//           error => {
//             resolve(null);
//           },
//         );
//       } else {
//         resolve(null);
//       }
//     });
//   });
// };
//
// const getOriginFromUrl = (url: string) => {
//   // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
//   const pathArray = url.split('/');
//   const protocol = pathArray[0];
//   const host = pathArray[2];
//   return protocol + '//' + host;
// };
//
// // Get underlying body if available. Works for text and json bodies.
// const getBodyContent = async (req: Request) => {
//   return Promise.resolve()
//     .then(() => {
//       if (req.method !== 'GET') {
//         const contentType = req.headers.get('Content-Type');
//         if (contentType && contentType.indexOf('json') !== -1) {
//           return req.json().then(json => {
//             return JSON.stringify(json);
//           });
//         } else {
//           return req.text();
//         }
//       }
//     })
//     .catch(error => {
//       // Ignore error.
//     });
// };
//
// self.addEventListener('fetch', event => {
//   const evt = event as FetchEvent;
//
//   const requestProcessor = async (idToken: string) => {
//     let req = evt.request;
//     let processRequestPromise = Promise.resolve();
//     // For same origin https requests, append idToken to header.
//     if (
//       self.location.origin == getOriginFromUrl(evt.request.url) &&
//       (self.location.protocol == 'https:' || self.location.hostname == 'localhost') &&
//       idToken
//     ) {
//       // Clone headers as request headers are immutable.
//       const headers = new Headers();
//       req.headers.forEach((val, key) => {
//         headers.append(key, val);
//       });
//       // Add ID token to header.
//       headers.append('Authorization', 'Bearer ' + idToken);
//       processRequestPromise = getBodyContent(req).then(body => {
//         try {
//           req = new Request(req.url, {
//             method: req.method,
//             headers: headers,
//             mode: 'same-origin',
//             credentials: req.credentials,
//             cache: req.cache,
//             redirect: req.redirect,
//             referrer: req.referrer,
//             body,
//             // bodyUsed: req.bodyUsed,
//             // context: req.context
//           });
//         } catch (e) {
//           // This will fail for CORS requests. We just continue with the
//           // fetch caching logic below and do not pass the ID token.
//         }
//       });
//     }
//     await processRequestPromise;
//     return await fetch(req);
//   };
//   // Fetch the resource after checking for the ID token.
//   // This can also be integrated with existing logic to serve cached files
//   // in offline mode.
//   evt.respondWith(getIdTokenPromise().then(requestProcessor, requestProcessor));
// });
//
// self.addEventListener('activate', event => {
//   event.waitUntil(clients.claim());
// });