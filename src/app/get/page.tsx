import { getFirestore } from 'firebase/firestore';
import { cookies } from 'next/headers';
import * as React from 'react';
import { FC } from 'react';
import Map from 'src/components/googleMaps/map';
import { Coordinates } from 'src/lib/firebase/interfaces';
import { getUsers } from 'src/lib/firebase/queries';
import { getAuthenticatedAppForUser } from 'src/lib/firebase/server-app';

export const dynamic = 'force-dynamic';

const NewHomePage: FC = async searchParams => {
  const cookieStore = cookies();
  const locInfo = cookieStore.get('geo');
  const initialCoords: Coordinates = locInfo ? JSON.parse(locInfo.value) : { lat: 5, lng: 5 };

  const shouldUseDarkMode = false;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();

  // const users = await getUsers(getFirestore(firebaseServerApp), searchParams);
  const c = JSON.stringify(currentUser?.email);
  console.log('current user in new home page', c);

  if (!googleMapsApiKey) return <div>No API key</div>;
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main
      className={`flex h-screen-small w-screen items-center justify-between
        ${shouldUseDarkMode ? 'bg-gray-900' : ''}
      `} // Full screen margin change: p-6
    >
      <Map googleMapsApiKey={googleMapsApiKey} initialCoords={initialCoords} currentUser={c} />

      {/*  shouldUseDarkMode={shouldUseDarkMode}*/}
      {/*  mapTimeMode={mapTimeMode}*/}
    </main>
  );
};
export default NewHomePage;
