import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';
import * as process from 'process';
import { Coordinates } from 'src/lib/firebase/interfaces/generics';

const Home: FC = async () => {
  const headerStore = headers();

  // Default coords: Toronto
  const defaultCoords: Coordinates = { lng: -79.387054, lat: 43.642567 };

  const lat = headerStore.get('x-vercel-ip-latitude');
  const lng = headerStore.get('x-vercel-ip-longitude');
  const timeZone = headerStore.get('x-vercel-ip-timezone');

  const initialCoords =
    lat && lng
      ? {
          lng: parseFloat(lng),
          lat: parseFloat(lat),
        }
      : // Try fetching geolocation using Google services; if not; return Toronto geolocation
        await fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`,
          { method: 'POST' },
        ).then(async response => {
          const locationObj = await response.json();
          if (locationObj.location)
            return { lng: locationObj.location.lng, lat: locationObj.location.lat };
          else return defaultCoords;
        });

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
      <Map initialCoords={initialCoords} shouldUseDarkMode={shouldUseDarkMode} />
    </main>
  );
};

export default Home;