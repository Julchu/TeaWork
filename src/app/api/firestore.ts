import { doc, getDoc } from 'firebase/firestore';
import { firestore } from 'src/lib/firebase';

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