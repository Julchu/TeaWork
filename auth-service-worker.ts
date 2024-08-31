import { FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let firebaseConfig: FirebaseOptions;

// Extract firebase config from query string
const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');
const lan = new URL(location.href).searchParams.get('lan') || '';

if (!serializedFirebaseConfig) {
  throw new Error('Firebase Config object not found in service worker query string.');
}

firebaseConfig = JSON.parse(serializedFirebaseConfig);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// const app = initializeApp(firebaseConfig);
// Initialize the Firebase app in the web worker.
const authentication = getAuth(app);

const CACHE_NAME = 'cache-v1';

// const urlsToCache = ['/', '/get', '/server.js', '/script.js', '/common.js', '/style.css'];

authentication.onAuthStateChanged(async user => {
  if (user) {
    console.log('user signed in', user.uid);
    console.log('user token:', await user.getIdToken());
  } else {
    console.log('user signed out');
  }
});

// /**
//  // * Returns a promise that resolves with an ID token if available.
//  // * @return {!Promise<?string>} The promise that resolves with an ID token if
//  // *     available. Otherwise, the promise resolves with null.
//  // */
const getIdToken = async () => {
  try {
    return await new Promise((resolve, reject) => {
      const unsubscribe = authentication.onAuthStateChanged(user => {
        unsubscribe();
        if (user) {
          user.getIdToken().then(
            idToken => {
              resolve(idToken);
            },
            error => {
              resolve(null);
            },
          );
        } else {
          resolve(null);
        }
      });
    });
  } catch (error_1) {
    console.log(error_1);
  }
};

// /**
//  * @param {string} url The URL whose origin is to be returned.
//  * @return {string} The origin corresponding to given URL.
//  */
const getOriginFromUrl = (url: string) => {
  // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
  const pathArray = url.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];
  return protocol + '//' + host;
};

self.addEventListener('install', event => {
  const fetchEvent = event as FetchEvent;
  // Perform install steps.
  fetchEvent.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Add all URLs of resources we want to cache.
      try {
        // return await cache.addAll(urlsToCache);
      } catch (error) {}
    }),
  );
});

// As this is a test app, let's only return cached data when offline.
self.addEventListener('fetch', async event => {
  const fetchEvent = event as FetchEvent;
  // Get underlying body if available. Works for text and json bodies.
  const getBodyContent = async (req: Request) => {
    const contentType = req.headers.get('Content-Type');
    try {
      await Promise.resolve();
      if (req.method !== 'GET') {
        if (contentType && contentType.indexOf('json') !== -1) {
          let json = await req.json();
          return JSON.stringify(json);
        } else {
          return req.text();
        }
      }
    } catch (error) {
      // Ignore error.
    }
  };
  const requestProcessor = async (value: unknown) => {
    const idToken = value as string;
    let req = fetchEvent.request;
    let processRequestPromise = Promise.resolve();
    // For same origin https requests, append idToken to header.
    if (
      self.location.origin == getOriginFromUrl(fetchEvent.request.url) &&
      /*self.location.protocol == 'https:' || */ self.location.hostname == 'localhost' &&
      idToken
    ) {
      // Clone headers as request headers are immutable.
      const headers = new Headers();
      for (let entry of req.headers.entries()) {
        headers.append(entry[0], entry[1]);
      }
      // Add ID token to header. We can't add to Authentication header as it
      // will break HTTP basic authentication.
      headers.append('Authorization', 'Bearer ' + idToken);
      // headers.append('Cache-Control', 'max-age=0');
      processRequestPromise = getBodyContent(req).then(body => {
        try {
          req = new Request(req.url, {
            method: req.method,
            headers: headers,
            mode: 'same-origin',
            credentials: req.credentials,
            cache: req.cache,
            redirect: req.redirect,
            referrer: req.referrer,
            body,
          });
        } catch (e) {
          // This will fail for CORS requests. We just continue with the
          // fetch caching logic below and do not pass the ID token.
        }
      });
    }
    return processRequestPromise
      .then(() => {
        return fetch(req);
      })
      .then(response => {
        // Check if we received a valid response.
        // If not, just funnel the error response.
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // If response is valid, clone it and save it to the cache.
        const responseToCache = response.clone();
        // Save response to cache only for GET requests.
        // Cache Storage API does not support using a Request object whose method is
        // not 'GET'.
        if (req.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(fetchEvent.request, responseToCache);
          });
        }
        // After caching, return response.
        return response;
      })
      .catch(error => {
        // For fetch errors, attempt to retrieve the resource from cache.
        return caches.match(fetchEvent.request.clone());
      })
      .catch(error => {
        // If error getting resource from cache, do nothing.
        console.log(error);
      });
  };
  // Try to fetch the resource first after checking for the ID token.
  const response = await getIdToken().then(requestProcessor, requestProcessor);
  // @ts-ignore
  fetchEvent.waitUntil(response);
});

self.addEventListener('activate', event => {
  const fetchEvent = event as FetchEvent;
  // Update this list with all caches that need to remain cached.
  const cacheWhitelist = ['cache-v1'];
  fetchEvent.waitUntil(
    caches.keys().then(async cacheNames => {
      await Promise.all(
        cacheNames.map(cacheName => {
          // Check if cache is not whitelisted above.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If not whitelisted, delete it.
            return caches.delete(cacheName);
          }
        }),
      );
      // @ts-ignore
      return self.clients.claim();
    }),
  );
});

// import { FirebaseOptions, getApps, initializeApp } from 'firebase/app';
// import { Auth, getAuth, getIdToken } from 'firebase/auth';
// import { getInstallations, getToken } from 'firebase/installations';
// // import { connectAuthEmulator } from '@firebase/auth';
//
// // this is set during install
// let firebaseConfig: FirebaseOptions;
// let lan: string;
//
// // Extract firebase config from query string
// const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');
// lan = new URL(location.href).searchParams.get('lan') || '';
//
// if (!serializedFirebaseConfig) {
//   throw new Error('Firebase Config object not found in service worker query string.');
// }
//
// firebaseConfig = JSON.parse(serializedFirebaseConfig);
//
// // const app = initializeApp(firebaseConfig);
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// const authentication = getAuth(app);
//
// // if (lan !== undefined) {
// //   connectAuthEmulator(authentication, `http://${lan}:9099`, {
// //     disableWarnings: true,
// //   });
// // }
//
// const installations = getInstallations(app);
//
// authentication.onAuthStateChanged(async user => {
//   if (user) {
//     console.log('user signed in', user.uid);
//     console.log('user token:', await user.getIdToken());
//   } else {
//     console.log('user signed out');
//   }
// });
//
// self.addEventListener('fetch', async event => {
//   const fetchEvent = event as FetchEvent;
//
//   const { origin, href } = new URL(fetchEvent.request.url);
//
//   if (origin !== self.location.origin) return;
//
//   try {
//     const response = await fetchWithFirebaseHeaders(fetchEvent);
//     if (response) fetchEvent.respondWith(response);
//   } catch (error) {
//     console.error('Error in auth-service-worker', error);
//   }
// });
//
// const fetchWithFirebaseHeaders = async (fetchEvent: FetchEvent) => {
//   try {
//     const [authIdToken, installationToken] = await Promise.all([
//       getAuthIdToken(authentication),
//       getToken(installations, true),
//     ]);
//
//     const headers = new Headers(fetchEvent.request.headers);
//
//     headers.append('Firebase-Instance-ID-Token', installationToken);
//     if (authIdToken) headers.append('Authorization', `Bearer ${authIdToken}`);
//     const newRequest = new Request(fetchEvent.request, { headers });
//
//     return await fetch(newRequest).catch(async error => {
//       console.log('Error fetching with new headers', error);
//       await fetchWithFirebaseHeaders(fetchEvent);
//     });
//   } catch (error) {
//     console.log('Error in auth service worker', error);
//   }
// };
//
// self.addEventListener('activate', event => {
//   const fetchEvent = event as FetchEvent;
//   // @ts-ignore
//   fetchEvent.waitUntil(self.clients.claim());
// });
//
// const getAuthIdToken = async (auth: Auth) => {
//   await auth.authStateReady();
//   if (!auth.currentUser) return;
//   return await getIdToken(auth.currentUser, true);
// };