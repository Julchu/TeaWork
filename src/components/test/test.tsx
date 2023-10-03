'use client';
import { FC } from 'react';
import { Button } from 'src/components/ui/button';
import { Label } from 'src/components/ui/label';
import { addDoc } from '@firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from 'src/lib/firebase/setup';
import { useCollection } from 'react-firebase-hooks/firestore';

const Test: FC = () => {
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

  return (
    <>
      {snapshot?.docs.map(doc => {
        return <Label key={doc.id}>{JSON.stringify(doc.data())}</Label>;
      })}

      <Button
        onClick={() => {
          test();
        }}
      >
        Click me
      </Button>

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
