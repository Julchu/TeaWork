'use client';
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapBoxGL, { LngLatLike } from "mapbox-gl";
import * as React from "react";
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import useDebouncedState from "src/hooks/use-debounced-hook";
import { Button } from "src/components/ui/button";
import * as process from "process";
import Spinner from "src/components/ui/spinner";
import { LocationMarkerIcon } from "src/components/ui/icons/location-marker";
import useUserHook from "src/hooks/use-user-firestore-hook";
import { useUserContext } from "src/hooks/use-user-context";
import { useAuthContext } from "src/hooks/use-auth-context";

/* Other map styles
 * style: 'mapbox://styles/mapbox/streets-v12',
 * style: 'mapbox://styles/mapbox/basic-v8',
 * style: 'mapbox://styles/mapbox/bright-v8',
 * style: 'mapbox://styles/mapbox/light-v11',
 * style: 'mapbox://styles/mapbox/satellite-v9',
 * style: 'mapbox://styles/mapbox/satellite-streets-v12',
 * style: 'mapbox://styles/mapbox/outdoors-v12',
 * style: 'mapbox://styles/mapbox/dark-v11,
 * style: 'mapbox://styles/mapbox/navigation-day-v1'
 * style: 'mapbox://styles/mapbox/navigation-night-v1'
 * style: 'mapbox://styles/jchumtl/clnfdhrsc080001qi3ye8e8mj',
 * */

// CN Tower long/lat: [-79.387054, 43.642567]
const Map: FC = () => {
  const { user } = useAuthContext();
  const { userInfo } = useUserContext();
  const { setUserInfo } = useUserContext();
  const [{ updateUser }] = useUserHook();

  const mapContainer = useRef<any>(null);
  const [geolocator, setGeolocator] = useState<mapBoxGL.GeolocateControl>();
  const map = useRef<mapBoxGL.Map | null>(null);
  const [initialCoords, setInitialCoords] = useState<LngLatLike>([-79.387054, 43.642567]);

  // Set map loading to true in page load
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  // If needed, debouncing lng/lat to slow down updates whenever map coordinates are moved
  const debouncedLocation = useDebouncedState<LngLatLike>(initialCoords);

  // Custom manual callback to fly to specific coordinates
  const flyTo = useCallback((center: LngLatLike, zoom: number = 15) => {
    map.current?.flyTo({ center, zoom });
  }, []);

  // Initial map loading
  useEffect(() => {
    // Prevent re-creating a map if one already exists
    if (map.current) return;

    mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    map.current = new mapBoxGL.Map({
      attributionControl: false,
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userInfo?.currentLocation || initialCoords,
      zoom: 9,
    });

    const currentGeolocator = new mapBoxGL.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    map.current.addControl(currentGeolocator);

    // map.current.on('load',  () => {
    //   setLocationLoading(true);
    // Disabled for manual geolocation; prevent console error about automatically triggering geolocation
    // geolocator?.trigger();
    // });

    // currentGeolocator.on('geolocate', async () => {
    //   setLocationLoading(false);
    // });

    setGeolocator(currentGeolocator);

    // Loading 3-D building styles
    map.current.on('style.load', () => {
      // Insert the layer beneath any symbol layer.
      const layers = map.current?.getStyle().layers;
      const labelLayerId = layers?.find(
        layer => layer.type === 'symbol' && layer.layout?.['text-field'],
      )?.id;

      // The 'building' layer in the Mapbox Streets
      // vector tile set contains building height data
      // from OpenStreetMap.
      map.current?.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          paint: {
            'fill-extrusion-color': '#aaa',

            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId,
      );
    });

    map.current?.resize();
  }, [initialCoords, updateUser, userInfo?.currentLocation]);

  // Manual geolocation triggering
  const triggerGeolocator = useCallback(() => {
    // Need to add locator control to set current location marker
    geolocator?.trigger();
  }, [geolocator]);

  const triggerNorth = useCallback(() => {
    // Need to add locator control to set current location marker
    map.current?.resetNorth({ duration: 2000 });
  }, []);

  // If map exists, trigger tracking map's current location
  useEffect(() => {
    map.current?.on('move', () => {
      if (map.current) {
        setInitialCoords([
          parseFloat(map.current.getCenter().lng.toFixed(4)),
          parseFloat(map.current.getCenter().lat.toFixed(4)),
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (user)
      updateUser({ currentLocation: debouncedLocation }).then(() => {
        setUserInfo(currentInfo => {
          return { ...currentInfo, currentLocation: debouncedLocation };
        });
      });
  }, [user, debouncedLocation, setUserInfo, updateUser]);

  useEffect(() => {
    setMapLoading(true);
    map.current?.on('load', () => {
      setMapLoading(false);
    });
  }, []);

  return (
    <div
      className={
        'overflow-hidden rounded-xl h-full w-full relative drop-shadow-lg bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200'
      }
    >
      {/* Actual map */}
      <div className={'w-full h-full'} ref={mapContainer} />

      {/* Extra layers on map (buttons, controls) */}
      <LocationButton
        mapLoading={mapLoading}
        locationLoading={locationLoading}
        setLocationLoading={setLocationLoading}
        flyTo={flyTo}
        triggerGeolocator={triggerGeolocator}
      />

      <NorthButton triggerNorth={triggerNorth} />
    </div>
  );
};

const NorthButton: FC<{ triggerNorth: () => void }> = ({ triggerNorth }) => {
  return (
    <Button
      // Location button
      className={'absolute bottom-20 right-5 opacity-50 w-[40px] h-[40px] p-0 rounded-full'}
      onClick={() => {
        triggerNorth();
      }}
    >
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
          d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </Button>
  );
};
const LocationButton: FC<{
  mapLoading: boolean;
  locationLoading: boolean;
  setLocationLoading: Dispatch<SetStateAction<boolean>>;
  flyTo: (center: LngLatLike, zoom?: number) => void;
  triggerGeolocator: () => void;
}> = ({ triggerGeolocator, mapLoading, locationLoading, setLocationLoading, flyTo }) => {
  const [currentCoords, setCurrentCoords] = useState<LngLatLike | undefined>();

  // Simple wrapper to trigger loading state
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    setLocationLoading(true);
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
    });
  }, [setLocationLoading]);

  // Flies home and sets marker
  const flyToCurrentLocation = useCallback(async () => {
    setLocationLoading(true);

    if (currentCoords) flyTo(currentCoords, 15);

    try {
      const pos = await getCurrentLocation();
      flyTo([pos.coords.longitude, pos.coords.latitude]);
      setCurrentCoords([pos.coords.longitude, pos.coords.latitude]);

      setLocationLoading(false);
    } catch (err) {
      console.log(`can't get coords because of ${err}`);
    }
  }, [setLocationLoading, currentCoords, flyTo, getCurrentLocation]);

  return (
    <>
      {mapLoading ? (
        <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
          <Spinner />
        </div>
      ) : (
        <Button
          // Location button
          className={'absolute bottom-5 right-5 opacity-50 w-[40px] h-[40px] p-0 rounded-full'}
          onClick={() => {
            flyToCurrentLocation();
            triggerGeolocator();
          }}
        >
          {locationLoading ? <Spinner /> : <LocationMarkerIcon />}
        </Button>
      )}
    </>
  );
};

export default Map;

// Add HTML marker
// const addMarker = useCallback(
//   (htmlElement: string, currentMap: mapBoxGL.Map, coords: LngLatLike) => {
//     const el = document.createElement('div');
//     el.className = 'marker';
//     el.innerHTML = htmlElement;
//
//     // make a marker for each feature and add to the map
//     new mapBoxGL.Marker(el).setLngLat(coords).addTo(currentMap);
//   },
//   [],
// );

// const htmlElement = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
//         <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
//       </svg>`;
//
// const animatedHtmlElement = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
//                 <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
//               </svg>`;
//
// if (map.current && currentCoords) {
//   addMarker(htmlElement, map.current, currentCoords);
//   addMarker(animatedHtmlElement, map.current, currentCoords);
// }
//
// <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2'}>
//   <Spinner />
// </div>