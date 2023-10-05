'use client';
import React, { FC, useEffect, useState } from 'react';
import { getAllData } from 'src/app/api/firestore';
import { GenericsUser } from 'src/lib/firebase/interfaces/generics';

const ClientComponent: FC = () => {
  const [data, setData] = useState<GenericsUser[]>([]);

  useEffect(() => {
    const goFetch = async () => {
      // setData(JSON.stringify(await getData('02wUnDjap2L7deE6ySu3')));
      setData(await getAllData());
    };

    goFetch();
  }, []);

  // return <div className={'bg-red-900'}>{data}</div>;
  return <div className={'bg-green-800'}>{data.map(user => JSON.stringify(user))}</div>;
};

export default ClientComponent;