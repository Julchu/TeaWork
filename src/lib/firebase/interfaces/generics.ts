import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { CollectionReference } from '@firebase/firestore';
import { firestore } from 'src/lib/firebase';

export type GenericsUser = { title: string; author: string };

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
  userCollection: collectionPoint<GenericsUser>('users'),
  userDoc: (...extraPaths: string[]) => docPoint<GenericsUser>('users', ...extraPaths),
};

const genericFunctions = async () => {
  const usersSnapshot = await getDocs(db.userCollection);
  const users = usersSnapshot.docs.map(doc => doc.data()); // has type Post[]

  const userSnapshot = await getDoc(db.userDoc('1'));
  const user = userSnapshot.data();
};