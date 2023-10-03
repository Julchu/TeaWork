'use client';
import { FC } from 'react';
import { Button } from 'app/components/ui/button';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from 'app/lib/firebase/setup';

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
const Test: FC = () => {
  return (
    <>
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
        Click me
      </Button>
    </>
  );
};

export default Test;