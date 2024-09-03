import { cookies } from 'next/headers';
import * as React from 'react';
import { FC } from 'react';
import Map from 'src/components/googleMaps/map';
import { Coordinates } from 'src/lib/firebase/interfaces';
import { User } from 'firebase/auth';

const HomePage: FC = async searchParams => {
  const cookieStore = cookies();
  // const authIdToken = headers().test('Authorization')?.split('Bearer ')[1];
  const authIdToken = cookies().get('__session')?.value;
  // const headerStore = headers();

  // console.log('cookies store', cookieStore.getAll());
  // console.log('header store', headerStore.test);
  const locInfo = cookieStore.get('geo');
  const initialCoords: Coordinates = locInfo ? JSON.parse(locInfo.value) : { lat: 5, lng: 5 };

  const shouldUseDarkMode = false;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // const { app, currentUser, firestore } = await getFirebaseServerApp();

  if (authIdToken) {
    try {
      const currentUser = await fetch('http://localhost:3001', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authIdToken}`,
        },
      }).then(async data => {
        return (await data.json()) as User;
      });
      // if (app) {
      //   // const user = await getUsers(firestore, searchParams);
      //   // console.log('current user info from /test/', JSON.stringify(user));
      // }
      console.log('currentUser', currentUser);
      const currentEmail = JSON.stringify(currentUser?.email);
      console.log('current email from /test', currentEmail);
    } catch (error) {
      console.log('fetch error', error);
    }
  }

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
        currentUser={'currentEmail'}
        // locInfo={JSON.stringify(locInfo)}
      />

      {/*  shouldUseDarkMode={shouldUseDarkMode}*/}
      {/*  mapTimeMode={mapTimeMode}*/}
    </main>
  );
};
export default HomePage;