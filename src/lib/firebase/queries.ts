import { collection, getDocs, query } from 'firebase/firestore';

export async function getUsers(db: any, filters = {}) {
  const q = query(collection(db, 'users'));

  const results = await getDocs(q);

  return results.docs.map(doc => {
    // console.log(doc);
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // timestamp: doc.data().timestamp.toDate(),
    };
  });
}
