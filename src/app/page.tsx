import { FC } from 'react';
import Test from 'src/components/test/test';
import MapTest from 'src/components/test/map-test';

const Home: FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Test />
      <MapTest />
    </main>
  );
};

export default Home;