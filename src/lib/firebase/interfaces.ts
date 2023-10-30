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

export type Interfaces = {
  firstName: string;
  lastName: string;
  email: string;
  lastLocation?: Coordinates;
  createdAt?: Timestamp | FieldValue;
  performanceMode?: boolean;
  mapStyle?: boolean;
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
  userCollection: collectionPoint<Interfaces>('users'),
  userDoc: (...extraPaths: string[]) => docPoint<Interfaces>('users', ...extraPaths),
};

/*
const genericFunctionsExamples = async () => {
  const userCollectionSnapshot = await getDocs(db.userCollection);
  const userCollection = userCollectionSnapshot.docs.map(doc => doc.data()); // has type Post[]

  const userDocSnapshot = await getDoc(db.userDoc('1'));
  const userDoc = userDocSnapshot.data();
};
*/