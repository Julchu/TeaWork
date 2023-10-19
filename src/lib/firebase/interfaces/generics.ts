import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  FieldValue,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';
import { CollectionReference } from '@firebase/firestore';
import { firestore } from 'src/lib/firebase/firebase-config';
import { LngLatLike } from 'mapbox-gl';

export type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  lastLocation?: LngLatLike;
  createdAt?: Timestamp | FieldValue;
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

const _genericFunctions = async () => {
  const userCollectionSnapshot = await getDocs(db.userCollection);
  const userCollection = userCollectionSnapshot.docs.map(doc => doc.data()); // has type Post[]

  const userDocSnapshot = await getDoc(db.userDoc('1'));
  const userDoc = userDocSnapshot.data();
};