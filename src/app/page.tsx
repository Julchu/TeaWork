import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';
import * as process from 'process';
import { Coordinates, MapTime } from 'src/lib/firebase/interfaces';

const Home: FC = async () => {
  const headerStore = headers();

  // Default coords: Toronto
  // const defaultCoords: Coordinates = { lng: -79.387054, lat: 43.642567 };

  // San Francisco: if SF is loaded then it means other geolocation metods have failed
  const defaultCoords: Coordinates = { lng: -122.419416, lat: 37.774929 };

  const ip = headerStore.get('x-forwarded-for');
  const lat = headerStore.get('x-vercel-ip-latitude');
  const lng = headerStore.get('x-vercel-ip-longitude');
  const timeZone = headerStore.get('x-vercel-ip-timezone');

  const devMode = !!process.env.NEXT_PUBLIC_EMULATOR_ENABLED;
  const fetchObj = {
    url: devMode
      ? `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`
      : `ipinfo.io/${ip}?token=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`,
    method: devMode ? 'POST' : 'GET',
  };

  const initialCoords =
    // Try fetching geolocation using Google services; if not; return Toronto geolocation
    await fetch(fetchObj.url, { method: fetchObj.method }).then(async response => {
      const locationObj = await response.json();

      if (devMode && locationObj.location)
        return { lng: locationObj.location.lng, lat: locationObj.location.lat };
      else if (locationObj['loc']) {
        const [lat, lng] = locationObj['loc'].split(',');
        return { lng, lat };
      }

      return defaultCoords;
    });
  // lat && lng
  //   ? {
  //       lng: parseFloat(lng),
  //       lat: parseFloat(lat),
  //     }
  //   :

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
        headerStore={`ipinfo.io/${ip}?token=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`}
      />
    </main>
  );
};

export default Home;