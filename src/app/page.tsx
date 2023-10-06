import { FC } from 'react';
import Map from 'src/components/test/map';

const Home: FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Map />
    </main>
  );
};

export default Home;