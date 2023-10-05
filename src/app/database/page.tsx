import React, { FC, Suspense } from "react";
import ServerComponent from "src/components/test/firebase/server-component";
import ReactFirebaseHook from "src/components/test/firebase/react-firebase-hook";
import Loading from "src/app/database/loading";
import { getData } from "src/app/api/firestore";

// const ReactFirebaseHook = dynamic(
//   () => import('src/components/test/firebase/react-firebase-hook'),
//   {
//     loading: () => <Testloading />,
//   },
// );

const Database: FC = async () => {
  const data = await getData('02wUnDjap2L7deE6ySu3');
  return (
    <div className={'bg-amber-400'}>
      <h1>SSR data:</h1>
      <Suspense fallback={<Loading />}>
        <ServerComponent />
      </Suspense>

      {JSON.stringify(data)}

      <h1>Client data</h1>
      <Suspense fallback={<Loading />}>
        <ReactFirebaseHook />
      </Suspense>
    </div>
  );
};

export default Database;