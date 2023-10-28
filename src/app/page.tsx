import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';

const Home: FC = async () => {
  const currentTime = new Date();
  const shouldUseDarkMode = 18 < currentTime.getHours() || currentTime.getHours() <= 6;

  const headerStore = headers();

  const lat = headerStore.get('x-vercel-ip-longitude');
  const lng = headerStore.get('x-vercel-ip-longitude');

  const coords =
    lat && lng
      ? {
          lng: parseFloat(lng),
          lat: parseFloat(lat),
        }
      : null;

  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main
      className={`flex h-screen-small w-screen items-center justify-between p-6
        ${shouldUseDarkMode ? 'bg-gray-900' : ''}
      `}
    >
      <Map headerCoords={coords ? coords : undefined} shouldUseDarkMode={shouldUseDarkMode} />
    </main>
  );
};

export default Home;