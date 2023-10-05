'use client';
import React, { FC } from 'react';
import { db } from 'src/lib/firebase/interfaces/generics';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const ReactFirebaseHook: FC = () => {
  const reactFirebaseHookUserCollectionRef = db.userCollection;

  const [reactFirebaseHooksData, reactFirebaseHooksLoading, reactFirebaseHooksError] =
    useCollectionData(reactFirebaseHookUserCollectionRef);

  // return <div className={'bg-red-900'}>{data}</div>;
  return (
    <div className={'bg-red-900'}>{reactFirebaseHooksData?.map(user => JSON.stringify(user))}</div>
  );
};

export default ReactFirebaseHook;