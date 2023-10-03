import { FC } from 'react';
import Test from 'src/components/test/test';

const Home: FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Test />
    </main>
  );
};

export default Home;
