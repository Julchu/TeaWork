'use client';
import React, { FC, useEffect } from 'react';
import { GenericsUser } from 'src/lib/firebase/interfaces/generics';
import { useStreamAllData } from 'src/app/api/firestore-hooks';

const ClientComponent: FC<{ initialData?: GenericsUser[] }> = ({ initialData }) => {
  // const [data, setData] = useState<GenericsUser[]>([]);
  const { users, getFirestoreData } = useStreamAllData();

  // useEffect(() => {
  //   const goFetch = async () => {
  //     // setData(JSON.stringify(await getData('02wUnDjap2L7deE6ySu3')));
  //     setData(await getAllData());
  //   };
  //
  //   goFetch();
  // }, []);

  useEffect(() => {
    getFirestoreData();
  }, [getFirestoreData]);

  // return <div className={'bg-red-900'}>{data}</div>;
  // return <div className={'bg-green-800'}>{data.map(user => JSON.stringify(user))}</div>;
  return <div className={'bg-green-800'}>{users?.map(user => JSON.stringify(user))}</div>;
};

export default ClientComponent;