import { FC } from 'react';
import { headers } from 'next/headers';
import process from 'process';

const Home: FC = async () => {
  const headerStore = headers();

  const initialCoords = {
    lng: -122.419416,
    lat: 37.774929,
  };

  // TODO: get timezone based on location/ip
  const vercelTimeZone = headerStore.get('x-vercel-ip-timezone');

  const timestamp = new Date().getTime() / 1000; //1697812766
  const timeZone =
    vercelTimeZone ||
    (await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${initialCoords.lat},${initialCoords.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_GEOLOCATION_API_KEY}&timestamp=${timestamp}`,
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

  return (
    <main>
      <div>headerStore: {JSON.stringify(headerStore)}</div>
      <div>timestamp: {JSON.stringify(timestamp)}</div>
      <div>timezone: {JSON.stringify(timeZone)}</div>
      <div>current hour: {JSON.stringify(currentHour)}</div>
    </main>
  );
};

export default Home;