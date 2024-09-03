import { cookies } from 'next/headers';
import * as React from 'react';
import { FC } from 'react';
import Map from 'src/components/googleMaps/map';
import { Coordinates } from 'src/lib/firebase/interfaces';
import { fetchUserInfo } from 'src/lib/actions';

const HomePage: FC = async searchParams => {
  const cookieStore = cookies();
  const authIdToken = cookies().get('__session')?.value;
  const locInfo = cookieStore.get('geo');
  const initialCoords: Coordinates = locInfo ? JSON.parse(locInfo.value) : { lat: 5, lng: 5 };

  const shouldUseDarkMode = false;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const currentUser = await fetchUserInfo(authIdToken);

  if (!googleMapsApiKey) return <div>No API key</div>;
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main
      className={`flex h-screen-small w-screen items-center justify-between
        ${shouldUseDarkMode ? 'bg-gray-900' : ''}
      `} // Full screen margin change: p-6
    >
      <Map
        googleMapsApiKey={googleMapsApiKey}
        initialCoords={initialCoords}
        currentUser={currentUser}
        // locInfo={JSON.stringify(locInfo)}
      />

      {/*  shouldUseDarkMode={shouldUseDarkMode}*/}
      {/*  mapTimeMode={mapTimeMode}*/}
    </main>
  );
};
export default HomePage;