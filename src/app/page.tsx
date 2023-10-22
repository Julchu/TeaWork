import { FC } from 'react';
import Map from 'src/components/map/map';

const Home: FC = async () => {
  const geolocationResponse = await fetch(`https://geolocation-db.com/json`);

  const { latitude, longitude } = await geolocationResponse.json();

  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen-small w-screen items-center justify-between p-6">
      <Map latitude={latitude} longitude={longitude} />
    </main>
  );
};

export default Home;