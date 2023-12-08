import { doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from 'src/lib/firebase/firebase-config';
import { db } from 'src/lib/firebase/interfaces';

export const getData = async (pathSegment: string) => {
  const docRef = doc(firestore, 'users', pathSegment);
  const docSnap = await getDoc(docRef);

  if (!docSnap) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  return docSnap.data();
};

export const getAllData = async () => {
  const usersSnapshot = await getDocs(db.userCollection);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return usersSnapshot.docs.map(doc => doc.data());
};

export const runtime = 'edge';