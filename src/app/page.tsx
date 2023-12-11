import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';
import { Coordinates, MapTime } from 'src/lib/firebase/interfaces';

const Home: FC = async () => {
  const headerStore = headers();

  // Default coords: Toronto
  // const defaultCoords: Coordinates = { lng: -79.387054, lat: 43.642567 };

  // San Francisco
  const defaultCoords: Coordinates = { lng: -122.419416, lat: 37.774929 };

  const lat = null; //headerStore.get('x-vercel-ip-latitude');
  const lng = null; //headerStore.get('x-vercel-ip-longitude');
  const timeZone = headerStore.get('x-vercel-ip-timezone');

  // const initialCoords =
  //   lat && lng
  //     ? {
  //         lng: parseFloat(lng),
  //         lat: parseFloat(lat),
  //       }
  //     : // Try fetching geolocation using Google services; if not; return Toronto geolocation
  //       await fetch(
  //         `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`,
  //         { method: 'POST' },
  //       ).then(async response => {
  //         const locationObj = await response.json();
  //         if (locationObj.location)
  //           return { lng: locationObj.location.lng, lat: locationObj.location.lat };
  //         else return defaultCoords;
  //       });
  const ip = headerStore.get('x-forwarded-for');
  const initialCoords = ip
    ? await fetch(`https://ip-api.com/#${ip.split(',')[0]}`).then(async response => {
        const locationObj = await response.json();
        if (locationObj.location) return { lng: locationObj.lon, lat: locationObj.lat };
        else return defaultCoords;
      })
    : defaultCoords;

  const time = parseInt(
    new Intl.DateTimeFormat([], {
      timeZone: timeZone || 'America/Toronto',
      hour: 'numeric',
      hourCycle: 'h24',
    }).format(),
  );

  const shouldUseDarkMode = 18 < time || time <= 6;
  const mapTimeMode: MapTime = 'dusk';

  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main
      className={`flex h-screen-small w-screen items-center justify-between p-6
        ${shouldUseDarkMode ? 'bg-gray-900' : ''}
      `}
    >
      <Map
        initialCoords={initialCoords}
        shouldUseDarkMode={shouldUseDarkMode}
        headerStore={headerStore}
      />
    </main>
  );
};

export default Home;