import React, { FC } from 'react';
import { GenericsUser } from 'src/lib/firebase/interfaces/generics';
import { getAllData } from 'src/app/api/firestore';

const ServerComponent: FC<{ initialData: GenericsUser[] }> = async ({ initialData }) => {
  // const data = JSON.stringify(await getData('02wUnDjap2L7deE6ySu3'));
  //
  // return <div className={'bg-blue-500'}>{data}</div>;

  const data = await getAllData();

  return (
    <div className={'bg-blue-500'}>
      {initialData.map(user => JSON.stringify(user)) || data.map(user => JSON.stringify(user))}
    </div>
  );
};

export default ServerComponent;