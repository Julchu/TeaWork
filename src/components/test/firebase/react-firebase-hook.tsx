'use client';
import React, { FC } from 'react';
import { useGetReactFirebaseHookData } from 'src/app/api/react-firestore-hooks-example';

const ReactFirebaseHook: FC = () => {
  const { reactFirebaseHooksData, reactFirebaseHooksLoading, reactFirebaseHooksError } =
    useGetReactFirebaseHookData();

  return (
    <div className={'bg-red-900'}>{reactFirebaseHooksData?.map(user => JSON.stringify(user))}</div>
  );
};

export default ReactFirebaseHook;