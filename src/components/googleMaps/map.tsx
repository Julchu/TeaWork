'use client';

import * as React from 'react';
import { FC } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { Coordinates, UserInfo } from 'src/lib/firebase/interfaces';

const MapComponent: FC<{
  googleMapsApiKey: string;
  initialCoords: Coordinates;
  currentUser?: UserInfo;
  locInfo?: any;
}> = ({ googleMapsApiKey, initialCoords, currentUser, locInfo }) => {
  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <Map
        className={'w-full h-full'}
        defaultCenter={initialCoords}
        defaultZoom={3}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      />
    </APIProvider>
  );
};

export default MapComponent;