'use client';
import { FC } from 'react';
import { Button } from 'src/components/ui/button';
import { Label } from 'src/components/ui/label';
import { addDoc } from '@firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from 'src/lib/firebase';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { reactFirebaseHooksConverter } from 'src/lib/firebase/interfaces/react-firebase-hooks';
import Link from 'next/link';
import { useAuthContext } from 'src/hooks/use-auth-context';

const Test: FC = () => {
  const { user } = useAuthContext();

  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('first', '==', 'Ada'));
  const [snapshot, loading, error] = useCollection(q);

  const test = async () => {
    try {
      const docRef = await addDoc(collection(firestore, 'users'), {
        first: 'Ada',
        last: 'Lovelace',
        born: 1815,
      });

      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const test2 = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'users'));
    querySnapshot.forEach(doc => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
  };

  const userCollectionRef = collection(firestore, 'users').withConverter(
    reactFirebaseHooksConverter,
  );

  const [data2, loading2, error2] = useCollectionData(userCollectionRef);

  if (!user) return null;

  return (
    <>
      {snapshot?.docs.map(doc => {
        return <Label key={doc.id}>{JSON.stringify(doc.data())}</Label>;
      })}

      <Button
        className={'rounded-xl'}
        onClick={() => {
          test();
        }}
      >
        Click me
      </Button>

      <Link href={'/examples'}>
        <Button>Go to example page</Button>
      </Link>

      <Button
        onClick={async () => {
          await test2();
        }}
      >
        Click me too
      </Button>
    </>
  );
};

export default Test;