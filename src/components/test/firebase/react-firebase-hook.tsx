'use client';
import React, { FC, useEffect, useState } from 'react';
import { getData } from 'src/app/api/firestore';

const ReactFirebaseHook: FC = () => {
  // const reactFirebaseHookUserCollectionRef = collection(firestore, 'users').withConverter(
  //   reactFirebaseHooksConverter,
  // );
  // const [reactFirebaseHooksData, reactFirebaseHooksLoading, reactFirebaseHooksError] =
  //   useCollectionData(reactFirebaseHookUserCollectionRef);

  // const officialUserCollectionRef = () =>
  //   collection(firestore.ts, 'users').withConverter(officialConverter);
  // // const usersSnapshot = await getDocs(UserCollection());
  // // const users = usersSnapshot.docs.map(doc => doc.data()); // has type Post[]
  // const usersSnapshot = await getDocs(UserCollection());
  // const users = usersSnapshot.docs.map(doc => doc.data()); //

  const [data, setData] = useState<string>('');

  useEffect(() => {
    const goFetch = async () => {
      setData(JSON.stringify(await getData('02wUnDjap2L7deE6ySu3')));
    };

    goFetch();
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return <div className={'bg-red-900'}>{data}</div>;
};

export default ReactFirebaseHook;