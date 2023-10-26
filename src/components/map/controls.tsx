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

import * as React from "react";
import { FC } from "react";
import { useUserContext } from "src/hooks/use-user-context";
import Spinner from "src/components/ui/spinner";
import { Button } from "src/components/ui/button";
import { NoPowerIcon, PowerIcon } from "src/components/ui/icons/power";
import { LocationIcon, NorthIcon } from "src/components/ui/icons/map-controls";

const Controls: FC<{
  mapLoading: boolean;
  locationLoading: boolean;
  triggerGeolocator: () => void;
  triggerNorth: () => void;
  triggerPerformance: () => void;
  triggerPink: () => void;
  shouldUseDarkMode: boolean;
}> = ({
  mapLoading,
  locationLoading,
  triggerGeolocator,
  triggerNorth,
  triggerPerformance,
  triggerPink,
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
      {/*<Button*/}
      {/*  // map.current?.setStyle(mapStyles.pink)*/}

      {/*  // Performance button*/}
      {/*  className={*/}
      {/*    'absolute bottom-20 left-5 opacity-60 bg-blue-600 w-[40px] h-[40px] p-0 rounded-full'*/}
      {/*  }*/}
      {/*  onClick={triggerPink}*/}
      {/*>*/}
      {/*  <Pink />*/}
      {/*</Button>*/}

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

const Pink: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
      />
    </svg>
  );
};
export default Controls;