import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';
import * as process from 'process';
import { Coordinates, MapTime } from 'src/lib/firebase/interfaces';

const Home: FC = async () => {
  const headerStore = headers();

  // Default coords: Toronto
  // const defaultCoords: Coordinates = { lng: -79.387054, lat: 43.642567 };

  // San Francisco: if SF is loaded then it means other geolocation methods have failed
  const defaultCoords: Coordinates = { lng: -122.419416, lat: 37.774929 };

  const ip = (headerStore.get('x-forwarded-for') || '').split(',')[0];
  const vercelLat = headerStore.get('x-vercel-ip-latitude');
  const vercelLng = headerStore.get('x-vercel-ip-longitude');

  const devMode = !!process.env.NEXT_PUBLIC_EMULATOR_ENABLED;
  const fetchObj = {
    url: devMode
      ? `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`
      : `https://ipinfo.io/${ip}?token=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`,
    method: devMode ? 'POST' : 'GET',
  };

  const initialCoords =
    vercelLat && vercelLng
      ? {
          lng: parseFloat(vercelLng),
          lat: parseFloat(vercelLat),
        }
      : // Try fetching geolocation using IpInfo.io services; if not; return Toronto geolocation
        await fetch(fetchObj.url, { method: fetchObj.method }).then(async response => {
          const locationObj = await response.json();
          if (devMode && locationObj['location']) {
            const { lat, lng } = locationObj['location'];
            return { lat, lng };
          } else if (locationObj['loc']) {
            const [lat, lng] = locationObj['loc'].split(',');
            return { lat, lng };
          } else {
            return defaultCoords;
          }
        });

  const vercelTimeZone = headerStore.get('x-vercel-ip-timezone');

  const timestamp = new Date().getTime() / 1000; //1697812766
  const timeZone =
    vercelTimeZone ||
    (await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${initialCoords.lat},${initialCoords.lng}&key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}&timestamp=${timestamp}`,
    ).then(async response => {
      const timezoneObject = await response.json();
      return timezoneObject['timeZoneId'];
    }));

  const currentHour = parseInt(
    new Intl.DateTimeFormat([], {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h24',
    }).format(),
  );

  const shouldUseDarkMode = 18 < currentHour || currentHour <= 6;
  const mapTimeMode =
    MapTime[
      Object.keys(MapTime)[
        Math.floor(currentHour / 6) % Object.keys(MapTime).length
      ] as keyof typeof MapTime
    ];

  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main
      className={`flex h-screen-small w-screen items-center justify-between
        ${shouldUseDarkMode ? 'bg-gray-900' : ''}
      `} // Full screen margin change: p-6
    >
      <Map
        initialCoords={initialCoords}
        shouldUseDarkMode={shouldUseDarkMode}
        mapTimeMode={mapTimeMode}
      />
    </main>
  );
};

export default Home;