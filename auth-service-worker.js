// [SNIPPET_REGISTRY disabled]
// [SNIPPETS_SEPARATION enabled]

// Docs: https://source.corp.google.com/piper///depot/google3/third_party/devsite/firebase/en/docs/auth/web/service-worker-sessions.md


// [START auth_svc_subscribe]
const { initializeApp, getApps } = require('firebase/app');
const { getAuth, onAuthStateChanged, getIdToken } = require('firebase/auth');
const { connectAuthEmulator } = require('firebase/auth');
const { connectFirestoreEmulator, getFirestore } = require('firebase/firestore');

let firebaseConfig;
let lan = '';
let emulatorsStarted = false;

// Extract firebase config from query string
const serializedFirebaseConfig = new URL(location.href).searchParams.get('firebaseConfig');
lan = new URL(location.href).searchParams.get('lan');

if (!serializedFirebaseConfig) {
  throw new Error('Firebase Config object not found in service worker query string.');
}

firebaseConfig = JSON.parse(serializedFirebaseConfig);

// Initialize the Firebase app in the service worker script.


/**
 * Returns a promise that resolves with an ID token if available.
 * @return {!Promise<?string>} The promise that resolves with an ID token if
 *     available. Otherwise, the promise resolves with null.
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);
const auth = getAuth(app);

if (!emulatorsStarted && lan) {
  connectAuthEmulator(auth, `http://localhost:9099`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  // emulatorsStarted = true;
}

console.log('auth', auth);

const getIdTokenPromise = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      if (user) {
        getIdToken(user).then(
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
};
// [END auth_svc_subscribe]

// See above

// [START auth_svc_intercept]
const getOriginFromUrl = url => {
  // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
  const pathArray = url.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];
  return protocol + '//' + host;
};

// Get underlying body if available. Works for text and json bodies.
const getBodyContent = req => {
  return Promise.resolve()
    .then(() => {
      if (req.method !== 'GET') {
        if (req.headers.get('Content-Type').indexOf('json') !== -1) {
          return req.json().then(json => {
            return JSON.stringify(json);
          });
        } else {
          return req.text();
        }
      }
    })
    .catch(error => {
      // Ignore error.
    });
};

self.addEventListener('fetch', event => {
  /** @type {FetchEvent} */
  const evt = event;

  const requestProcessor = idToken => {
    let req = evt.request;
    let processRequestPromise = Promise.resolve();
    // For same origin https requests, append idToken to header.
    if (
      self.location.origin === getOriginFromUrl(evt.request.url) &&
      (self.location.protocol === 'https:' || self.location.hostname === 'localhost') &&
      idToken
    ) {
      // Clone headers as request headers are immutable.
      const headers = new Headers();
      req.headers.forEach((val, key) => {
        headers.append(key, val);
      });
      // Add ID token to header.
      console.log('idToken', idToken);
      headers.append('Authorization', 'Bearer ' + idToken);
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
            // bodyUsed: req.bodyUsed,
            // context: req.context
          });
        } catch (e) {
          // This will fail for CORS requests. We just continue with the
          // fetch caching logic below and do not pass the ID token.
          console.log('error making request', e);
        }
      });
    }
    return processRequestPromise.then(() => {
      return fetch(req).catch((e) => console.log('error fetching', e));
    });
  };
  // Fetch the resource after checking for the ID token.
  // This can also be integrated with existing logic to serve cached files
  // in offline mode.
  try {
    evt.respondWith(getIdTokenPromise().then(requestProcessor, requestProcessor));
  } catch (e) {
    console.log('evt response err', e);
  }
});
// [END auth_svc_intercept]

// [START auth_svc_listen_activate]
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
// [END auth_svc_listen_activate]