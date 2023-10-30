/*<TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>*/

import * as React from 'react';
import { FC } from 'react';
import { useUserContext } from 'src/hooks/use-user-context';
import Spinner from 'src/components/ui/spinner';
import { Button } from 'src/components/ui/button';
import { NoPowerIcon, PowerIcon } from 'src/components/ui/icons/power';
import { LocationIcon, NorthIcon } from 'src/components/ui/icons/map-controls';

const Controls: FC<{
  mapLoading: boolean;
  locationLoading: boolean;
  triggerGeolocator: () => void;
  triggerNorth: () => void;
  triggerPerformance: () => void;
  shouldUseDarkMode: boolean;
}> = ({
  mapLoading,
  locationLoading,
  triggerGeolocator,
  triggerNorth,
  triggerPerformance,
  shouldUseDarkMode,
}) => {
  const { userInfo } = useUserContext();

  if (mapLoading)
    return (
      <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
        <Spinner shouldUseDarkMode={shouldUseDarkMode} />
      </div>
    );
  return (
    <>
      <Button
        // Performance button
        className={
          'absolute bottom-5 left-5 opacity-60 bg-blue-600 w-[40px] h-[40px] p-0 rounded-full'
        }
        onClick={triggerPerformance}
      >
        {userInfo?.performanceMode ? <PowerIcon /> : <NoPowerIcon />}
      </Button>

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