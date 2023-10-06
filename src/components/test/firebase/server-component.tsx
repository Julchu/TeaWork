import React, { FC } from 'react';
import { getAllData } from 'src/app/api/firestore';

const ServerComponent: FC = async () => {
  const data = await getAllData();

  return <div className={'bg-blue-500'}>{data.map(user => JSON.stringify(user))}</div>;
};

export default ServerComponent;