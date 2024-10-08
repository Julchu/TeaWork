import React, { Dispatch, FC, RefObject, SetStateAction, useCallback } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import Spinner from 'src/components/ui/spinner';
import { Button } from 'src/components/ui/button';
import { NoPowerIcon, PowerIcon } from 'src/components/ui/icons/power';
import { LocationIcon, NorthIcon } from 'src/components/ui/icons/map-controls';
import useMapHook from 'src/hooks/use-map-hook';
import { Map } from 'mapbox-gl';

const Controls: FC<{
  map: RefObject<Map>;
  mapLoading: boolean;
  setMapLoading: Dispatch<SetStateAction<boolean>>;
  locationLoading: boolean;
  triggerGeolocator: () => void;
  shouldUseDarkMode: boolean;
}> = ({
  map,
  mapLoading,
  setMapLoading,
  locationLoading,
  triggerGeolocator,
  shouldUseDarkMode,
}) => {
  const { userInfo } = useAuthContext();
  const [{ updatePerformance, triggerNorth, togglePerformanceLayer }] = useMapHook(
    map,
    mapLoading,
    setMapLoading,
  );

  const updatePerformanceCallback = useCallback(async () => {
    await updatePerformance();
    togglePerformanceLayer(!userInfo?.performanceMode);
  }, [togglePerformanceLayer, updatePerformance, userInfo?.performanceMode]);

  if (mapLoading)
    return (
      <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
        <Spinner shouldUseDarkMode={shouldUseDarkMode} />
      </div>
    );
  return (
    <>
      {userInfo && Object.values(userInfo).length > 0 ? (
        <Button
          // Performance button
          className={
            'absolute bottom-5 left-5 opacity-60 bg-blue-600 w-[40px] h-[40px] p-0 rounded-full'
          }
          onClick={updatePerformanceCallback}
        >
          {userInfo?.performanceMode ? <PowerIcon /> : <NoPowerIcon />}
        </Button>
      ) : null}

      <Button
        // North button
        className={
          'absolute bottom-20 right-5 opacity-60 bg-blue-600 w-[40px] h-[40px] p-0 rounded-full'
        }
        onClick={triggerNorth}
      >
        <NorthIcon />
      </Button>

      <Button
        // Location button
        className={
          'absolute bottom-5 opacity-60 bg-blue-600 right-5 w-[40px] h-[40px] p-0 rounded-full'
        }
        onClick={triggerGeolocator}
      >
        <LocationIcon className={`absolute`} />
        <LocationIcon className={`absolute ${locationLoading ? 'animate-ping' : ''}`} />
      </Button>
    </>
  );
};

export default Controls;