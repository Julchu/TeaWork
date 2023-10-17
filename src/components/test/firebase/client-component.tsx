'use client';
import React, { FC } from 'react';
import { useStreamAllData } from 'src/app/api/firestore-hooks';

const ClientComponent: FC = () => {
  const { users } = useStreamAllData();

  return <div className={'bg-green-800'}>{users?.map(user => JSON.stringify(user))}</div>;
};

export default ClientComponent;