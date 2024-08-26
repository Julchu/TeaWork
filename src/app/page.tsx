import { FC } from 'react';
import Map from 'src/components/map/map';
import { headers } from 'next/headers';
import * as process from 'process';
import { Coordinates, MapTime } from 'src/lib/firebase/interfaces';

const Home: FC = async () => {
  const headerStore = headers();

  // Toronto; 'America/Toronto'
  // const defaultCoords: Coordinates = { lng: -79.387054, lat: 43.642567 };
  // const defaultTimezone = 'America/Toronto'

  // San Francisco; : if SF is loaded then it means other geolocation methods have failed
  const defaultCoords: Coordinates = { lng: -122.419416, lat: 37.774929 };
  const defaultTimezone = 'America/Los_Angeles';

  const ip = (headerStore.get('x-forwarded-for') || '').split(',')[0];

  const vercelLat = headerStore.get('x-vercel-ip-latitude');
  const vercelLng = headerStore.get('x-vercel-ip-longitude');

  // Localhost IP would return ::1 which is invalid; shortest possible IP might be 5 digits
  const url = `https://ipinfo.io/${ip.length >= 5 ? ip : ''}?token=${
    process.env.NEXT_PUBLIC_IPINFO_GEOLOCATION_API_KEY
  }`;

  const [initialCoords, timeZone] =
    vercelLat && vercelLng
      ? [
          {
            lng: parseFloat(vercelLng),
            lat: parseFloat(vercelLat),
          },
          headerStore.get('x-vercel-ip-timezone'),
        ]
      : // Try fetching geolocation using IpInfo.io services; if not; return Toronto geolocation
        await fetch(url).then(async response => {
          const locationObj = await response.json();
          if (locationObj['loc'] && locationObj['timezone']) {
            const [lat, lng] = locationObj['loc'].split(',');
            return [{ lat, lng }, locationObj['timezone']];
          } else {
            return [defaultCoords, defaultTimezone];
          }
        });

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