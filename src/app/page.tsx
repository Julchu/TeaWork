import { FC } from 'react';
import Map from 'src/components/map/map';
import * as process from 'process';

const Home: FC = async () => {
  const geolocationResponse = await fetch(
    `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GEOLOCATION_API_KEY}`,
    { method: 'POST' },
  );

  const {
    location: { lat = null, lng = null },
  } = await geolocationResponse.json();

  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen-small w-screen items-center justify-between p-6">
      <Map latitude={lat} longitude={lng} />
    </main>
  );
};

export default Home;