import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  FieldValue,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';
import { CollectionReference } from '@firebase/firestore';
import { firestore } from 'src/lib/firebase/firebase-config';

export type Coordinates = { lat: number; lng: number };

export enum MapStyle {
  standard = 'standard',
  grey = 'grey',
  nav = 'nav',
  satellite = 'satellite',
  pink = 'pink',
  streets = 'streets',
}

export enum MapTime {
  'night' = 'night',
  'dawn' = 'dawn',
  'day' = 'day',
  'dusk' = 'dusk',
}

export type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  lastLocation?: Coordinates;
  createdAt?: Timestamp | FieldValue;
  performanceMode?: boolean;
  mapStyle?: MapStyle;
};

type Wifi = {
  available: boolean;
  name: string;
  password?: string;
  fast?: boolean;
};

type BathroomLock = {
  type: 'key' | 'code';
  code?: string;
};

type Bathroom = {
  available: boolean;
  locked: BathroomLock;
};

export type Cafe = {
  name: string;
  wifi: Wifi;
  outlet: boolean;
  bathroom: Bathroom;
  clean: boolean;
  busy: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  parking: boolean;
};

export const genericConverter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: PartialWithFieldValue<T>) => {
    return data as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) =>
    snapshot.data(options) as T,
});

const collectionPoint = <T>(collectionPath: string): CollectionReference<T> =>
  collection(firestore, collectionPath).withConverter(genericConverter<T>());

const docPoint = <T>(collectionPath: string, ...extraPaths: string[]): DocumentReference<T> =>
  doc(firestore, collectionPath, ...extraPaths).withConverter(genericConverter<T>());

export const db = {
  userCollection: collectionPoint<UserInfo>('users'),
  userDoc: (...extraPaths: string[]) => docPoint<UserInfo>('users', ...extraPaths),
};

/*
const genericFunctionsExamples = async () => {
  const userCollectionSnapshot = await getDocs(db.userCollection);
  const userCollection = userCollectionSnapshot.docs.map(doc => doc.data()); // has type Post[]

  const userDocSnapshot = await getDoc(db.userDoc('1'));
  const userDoc = userDocSnapshot.data();
};
*/