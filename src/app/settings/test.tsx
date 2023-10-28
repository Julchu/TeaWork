import { cookies, headers } from 'next/headers';

const TestSettings = () => {
  const cookieStore = cookies();
  const headerStore = headers();
  console.log(JSON.stringify(cookieStore));
  // console.log(JSON.stringify(headerStore));
  return <h1 className={'bg-amber-300'}>Cheese</h1>;
};

export default TestSettings;