import React, { FC } from 'react';
import { getAllData } from 'src/app/api/firestore';

const ServerComponent: FC = async () => {
  // const data = JSON.stringify(await getData('02wUnDjap2L7deE6ySu3'));
  //
  // return <div className={'bg-blue-500'}>{data}</div>;

  const data = await getAllData();

  return <div className={'bg-blue-500'}>{data.map(user => JSON.stringify(user))}</div>;
};

export default ServerComponent;