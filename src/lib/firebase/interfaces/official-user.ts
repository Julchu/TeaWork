import { collection, doc, FirestoreDataConverter, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from 'src/lib/firebase';

export type OfficialUser = { title: string; author: string };

export const officialConverter: FirestoreDataConverter<OfficialUser> = {
  toFirestore(user) {
    return user;
  },

  fromFirestore(snapshot) {
    return snapshot.data() as OfficialUser;
  },
};

const UserCollection = () => collection(firestore, 'users').withConverter(officialConverter);

const UserDoc = (id: string) => doc(firestore, 'users', id).withConverter(officialConverter);

const userFunctions = async () => {
  const usersSnapshot = await getDocs(UserCollection());
  const users = usersSnapshot.docs.map(doc => doc.data()); // has type Post[]

  const userSnapshot = await getDoc(UserDoc('1'));
  const user = userSnapshot.data(); // has type User | undefined
};