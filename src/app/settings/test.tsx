import { FC } from 'react';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

const TestSettings: FC<{ cookieStore: ReadonlyRequestCookies; headerStore: ReadonlyHeaders }> = ({
  cookieStore,
  headerStore,
}) => {
  console.log('inside test.tsx', JSON.stringify(cookieStore));
  console.log('inside test.tsx', JSON.stringify(headerStore));
  return (
    <>
      <h1 className={'bg-amber-300'}>{JSON.stringify(cookieStore)}</h1>
      <h1 className={'bg-amber-300'}>{JSON.stringify(headerStore)}</h1>
    </>
  );
};

export default TestSettings;