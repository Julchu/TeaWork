import { FC } from 'react';
import Map from 'src/components/test/map';

const Home: FC = () => {
  return (
    <main className="flex h-screen w-screen items-center justify-between p-6 ">
      <div className={'overflow-hidden rounded-2xl h-full w-full relative'}>
        <Map />
      </div>
    </main>
  );
};

export default Home;