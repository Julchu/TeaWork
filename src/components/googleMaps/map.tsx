'use client';

import * as React from 'react';
import { FC } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Coordinates } from 'src/lib/firebase/interfaces';
import { Button } from 'src/components/ui/button';
import { montserrat } from 'src/components/ui/fonts';
import { useAuthContext } from 'src/hooks/use-auth-context';

const MapComponent: FC<{
  googleMapsApiKey: string;
  initialCoords: Coordinates;
  currentUser: any;
}> = ({ googleMapsApiKey, initialCoords, currentUser }) => {
  const { authUser, logout, login } = useAuthContext();
  // console.log('users', users);
  console.log('currentUser within map component', JSON.stringify(currentUser));

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <Button
        onClick={login}
        className={`font-bold  opacity-60 bg-blue-600 w-[50px] h-[50px] p-0 rounded-full ${montserrat.className}`}
      >
        Sign In
      </Button>

      <Button
        onClick={logout}
        className={`font-bold  opacity-60 bg-blue-600 w-[50px] h-[50px] p-0 rounded-full ${montserrat.className}`}
      >
        Sign out
      </Button>

      {/*<Map*/}
      {/*  className={'w-full h-full'}*/}
      {/*  defaultCenter={initialCoords}*/}
      {/*  defaultZoom={3}*/}
      {/*  gestureHandling={'greedy'}*/}
      {/*  disableDefaultUI={true}*/}
      {/*/>*/}
    </APIProvider>
  );
};

export default MapComponent;