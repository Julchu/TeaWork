import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';

const Home: FC = async () => {
  const headerStore = headers();

  const lat = headerStore.get('x-vercel-ip-latitude');
  const lng = headerStore.get('x-vercel-ip-longitude');
  const timeZone = headerStore.get('x-vercel-ip-timezone');

  const coords =
    lat && lng
      ? {
          lng: parseFloat(lng),
          lat: parseFloat(lat),
        }
      : { lng: -79.387054, lat: 43.642567 };
  /*
  *
  *  fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`,
          { method: 'POST' },
        ).then(async response => {
          const locationObj = await response.json();
          return { lng: locationObj.location.lng, lat: locationObj.location.lat };
        });
        * */

  const time = parseInt(
    new Intl.DateTimeFormat([], {
      timeZone: timeZone || 'America/Toronto',
      hour: 'numeric',
      hourCycle: 'h24',
    }).format(),
  );

  const shouldUseDarkMode = 18 < time || time <= 6;

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