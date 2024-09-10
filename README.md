# TeaWork

Finding pleasant cafes to grab coffee and to work at

Filter and save specific work environment information about nearby places

# TODO: update README with info on GCP, separate Node server, etc...

- [TODO Board](https://github.com/users/Julchu/projects/6)

# Setup

### NodeJS, `npm`, `yarn`

- You'll need to download [NodeJS](https://nodejs.org/en/) and install to `npm` (Node Package Manager) to PATH so that
  you can run commands to download packages used to create React projects.

- The main package you'll need is a separate package manager called `yarn`, which functions similarly (like a super
  layer) to `npm`

### Why `yarn`

- NextJS uses `yarn` over `npm` by default
- `yarn` installs packages in parallel rather than one-by-one, like `npm` does
- `yarn`'s lockfile is a lot more sturdy than `npm`'s lockfile

```bash
npm install --global yarn
```

### Firebase/Firestore emulator

- You'll need Firebase installed globally

```zsh
npm install -g firebase-tools
````

or

```zsh
yarn global add firebase-tools
```

### Git

- You'll need [git](https://git-scm.com/downloads) installed to copy the project into your local directory

### Environment files

- You'll need a copy of `.env.example` for your development environment

```zsh
# Copy and setup your environment: copies .env.example into new files .env.development and .env.production
# .env.production is not currently used (TODO: import into Dockerfile)
# .env.development is used by Next.js locally
cp .env.example .env.development .env.production
```

### Cloning and installing the app

```zsh
# Go to your preferred project directory; a folder called teawork will be added
git clone https://github.com/Julchu/TeaWork.git
cd teawork

# Installing the React app; a browser tab should open at localhost:3000
# Use yarn dev instead of docker compose up for local development; docker compose up will use real production environment
yarn install
yarn dev

# Old deploying to Firebase; make sure to comment out lines to connect emulators in /lib/firebase/client-app.ts before deploying
# Optional flag: --except functions
yarn build && firebase --project teaworkapp deploy

# Deploying app to live on GCP; make sure to comment out lines to connect emulators in /lib/firebase/client-app.ts before deploying
docker compose build
gcloud builds submit --tag gcr.io/teaworkapp/feat/docker-gcp --project teaworkapp
gcloud run deploy --image gcr.io/teaworkapp/feat/docker-gcp --project teaworkapp --platform managed
```

### Launching the Firebase/Firestore emulator:

- Open the emulator at localhost:4000/firestore
- Also exports/imports emulator data to `./emulatorData`

```zsh
firebase --project="teaworkapp" emulators:start --only auth,firestore,storage --export-on-exit ./emulatorData --import ./emulatorData
```

- `firebase --project="teaworkapp"` identifies the project `teawork` to run commands on
- `firebase emulators:start` starts emulators that were setup in `firebase.json` and `client-auth.js`
- `firebase emulators:start --only auth,firestore,storage` starts emulators for auth, Firestore (NoSQL database),
  storage (file storage like images)
- `firebase --import ./emulatorData` imports previously-exported data from `present working director/emulatorData`
- `firebase --export-on-exit ./emulatorData` exports all your local Firestore data when you close your emulators

### Sometimes emulator port is in use, this command will kill that port

- Close emulator with (`CTRL` + `C`) ONCE; twice might improperly terminate the emulators and prevent you from opening
  another on the same port

```zsh
sudo kill -9 $(sudo lsof -t -i:8080)
```

### Prettier (format on save)

- In VSCode, install the extension Prettier
- Go to your VSCode JSON settings:
    - Command Palette -> Preferences: Open Settings (JSON)
- Add the following code to the JSON object
- Whenever you save a file, it'll run automatic formatting based on rules defined in `/.prettierrc.json`

```json
// settings.json
{
  ...
  "editor.tabSize": 2,
  // Add this to enable autosave in VSCode with Prettier
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  ...
}
```

- I also use file auto-save whenever I switch to a different page/window, mimicking Webstorm

```json
{
  "files.autoSave": "onFocusChange"
}
```

## Basic testing

We're using ESLint to test for basic JavaScript and TypeScript errors

You can run `lint` and `type-check` to check for basic project syntax errors

```zsh
# In root directory (/teawork)
yarn lint
yarn type-check
```

# Notes

## Firestore

```ts
const newUserRef = await addDoc(db.userCollection, { userData });

const userDoc = await getDoc(newUserRef);
if (userDoc.exists()) {
  const user = userDoc.data();
}

const existingUser = await getDocs(query(db.userCollection, where('uid', '==', uid)));

if (existingUser.docs.length) {
  const user = existingUser.docs[0].data();
}
```