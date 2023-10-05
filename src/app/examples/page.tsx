import React, { FC, Suspense } from "react";
import ServerComponent from "src/components/test/firebase/server-component";
import ReactFirebaseHook from "src/components/test/firebase/react-firebase-hook";
import Loading from "src/app/examples/loading";
import { getAllData } from "src/app/api/firestore";
import ClientComponent from "src/components/test/firebase/client-component";

// Two examples of Server Component and 1 Client Component being rendered in a server component
// Data comparison for SSR data: 1 wrapped in Suspense, 1 rendered SSR, and 1 CSR
const Example: FC = async () => {
  // const data = await getData('02wUnDjap2L7deE6ySu3');
  const data = await getAllData();
  return (
    <div className={'bg-amber-400'}>
      <Suspense fallback={<Loading />}>
        <ServerComponent />
      </Suspense>

      {/*{JSON.stringify(data)}*/}
      {data.map(user => JSON.stringify(user))}

      <Suspense fallback={<Loading />}>
        <ReactFirebaseHook />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <ClientComponent />
      </Suspense>
    </div>
  );
};

export default Example;