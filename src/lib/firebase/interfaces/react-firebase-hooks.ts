import { FirestoreDataConverter } from 'firebase/firestore';

export type ReactFirebaseHooksUser = {
  author: string;
  title: string;
};

export const reactFirebaseHooksConverter: FirestoreDataConverter<ReactFirebaseHooksUser> = {
  toFirestore(user) {
    return user;
  },
  fromFirestore(snapshot, options) {
    return snapshot.data(options) as ReactFirebaseHooksUser;
  },
};

// export type WithId<T> = {
//   id: string;
// } & T;
//
// export type WithRef<T> = {
//   ref: DocumentReference<DocumentData>;
// } & T;

// <WithId<WithRef<Post>>>
// return {
//   ...data,
//   id: snapshot.id,
//   ref: snapshot.ref,
// };