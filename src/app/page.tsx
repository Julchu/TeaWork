import { FC } from 'react';
import Map from 'src/components/test/map';

const Home: FC = () => {
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen w-screen items-center justify-between p-6">
      <div className={'overflow-hidden rounded-2xl h-full w-full relative drop-shadow-lg'}>
        <Map />
      </div>
    </main>
  );
};

export default Home;