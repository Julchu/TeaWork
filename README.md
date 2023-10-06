# TeaWork

Finding pleasant cafes to grab coffee and to work at

Filter and save specific work environment information about nearby places

# TODO:

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
yarn global add firebase-tools
```

### Git

- You'll need [git](https://git-scm.com/downloads) installed to copy the project into your local directory

### Environment files

- You'll need a copy of `.env.example` as your development environment, as well as a production environment when
  deploying to live

```zsh
# Copy and setup your environment
cp .env.example .env.development .env.production
```

### Cloning and installing the app

```zsh
# Go to your preferred project directory; a folder called teawork will be added
git clone https://github.com/Julchu/TeaWork.git
cd teawork

# Installing the React app; a browser tab should open at localhost:3000
yarn install
yarn dev

# Deploying app to live; make sure to comment out lines to connect emulators in /lib/firebase/index.ts before deploying
# Optional flag: --except functions
yarn export && firebase --project teaworkapp deploy
```

### Launching the Firebase/Firestore emulator:

- Open the emulator at localhost:4000/firestore
- Also exports/imports emulator data to `./emulatorData`

```zsh
firebase --project="teaworkapp" emulators:start --only auth,firestore.ts,storage --export-on-exit ./emulatorData --import ./emulatorData
```

### Sometimes emulator port is in use, this command will kill that port

```zsh
sudo kill -9 $(sudo lsof -t -i:8080)
```

### Prettier (format on save)

- In VSCode, install the extention Prettier
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

- I also use file autosave whenever I switch to a different page/window, mimicking Webstorm

```json
{
  "files.autoSave": "onFocusChange"
}
```

## Testing

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