import React, { FC, Suspense } from "react";
import ServerComponent from "src/components/test/firebase/server-component";
import ReactFirebaseHook from "src/components/test/firebase/react-firebase-hook";
import Loading from "src/app/examples/loading";
import { getAllData } from "src/app/api/firestore";
import ClientComponent from "src/components/test/firebase/client-component";

// Two examples of Server Component and 1 Client Component being rendered in a server component
// Data comparison for SSR data: 1 wrapped in Suspense, 1 rendered SSR, and 1 CSR
const Example: FC = async () => {
  const data = await getAllData();
  return (
    <div className={'bg-amber-400 leading-loose flex-col'}>
      <h1 className={'place-self-center'}>Server Component w/ Suspense</h1>
      <Suspense fallback={<Loading />}>
        <ServerComponent initialData={data} />
      </Suspense>

      {/* This one will not be affected by an inner suspense, only the outer one, because data is rendered in this component */}
      <h1 className={'place-self-center'}>Parent Server Component w/o Suspense</h1>
      {data.map(user => JSON.stringify(user))}

      <h1 className={'place-self-center'}>Client Component w/ Suspense</h1>
      <Suspense fallback={<Loading />}>
        <ClientComponent />
      </Suspense>

      <h1 className={'place-self-center'}>Firebase Hooks Client Component w/ Suspense</h1>
      <Suspense fallback={<Loading />}>
        <ReactFirebaseHook />
      </Suspense>
    </div>
  );
};

export default Example;