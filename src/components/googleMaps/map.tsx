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
  currentUser?: string;
  locInfo?: any;
}> = ({ googleMapsApiKey, initialCoords, currentUser, locInfo }) => {
  const { logout, login } = useAuthContext();

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <Button
        className={`font-bold  opacity-60 bg-blue-600 w-[50px] h-[50px] p-0 rounded-full ${montserrat.className}`}
      >
        {currentUser}
      </Button>
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