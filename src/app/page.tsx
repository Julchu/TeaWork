import { FC } from 'react';
import Map from 'src/components/test/map';

const Home: FC = () => {
  return (
    <main className="flex h-screen w-screen items-center justify-between p-6 bg-red-950">
      <Map />
    </main>
  );
};

export default Home;