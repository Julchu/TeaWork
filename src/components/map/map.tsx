'use client';
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import mapBoxGL, { LngLatLike } from "mapbox-gl";
import * as React from "react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "src/components/ui/button";
import * as process from "process";
import Spinner from "src/components/ui/spinner";
import { LocationMarkerIcon, NorthIcon } from "src/components/ui/icons/map-controls";
import useUserHook from "src/hooks/use-user-firestore-hook";
import { useAuthContext } from "src/hooks/use-auth-context";
import { cn } from "src/lib/utils";
import { useUserContext } from "src/hooks/use-user-context";
import { NoPowerIcon, PowerIcon } from "src/components/ui/icons/power";
import { Coordinates } from "src/lib/firebase/interfaces/generics";

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
 * style: 'mapbox://styles/mapbox/standard-beta',
 * */
const mapStyles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  basic: 'mapbox://styles/mapbox/basic-v8',
  bright: 'mapbox://styles/mapbox/bright-v8',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  navDay: 'mapbox://styles/mapbox/navigation-day-v1',
  navNight: 'mapbox://styles/mapbox/navigation-night-v1',
  pink: 'mapbox://styles/jchumtl/clnfdhrsc080001qi3ye8e8mj',
  standard: 'mapbox://styles/mapbox/standard-beta',
};

// CN Tower long/lat: [-79.387054, 43.642567]
const Map: FC<{ shouldUseDarkMode: boolean }> = ({ shouldUseDarkMode }) => {
  const { userInfo, setUserInfo } = useUserContext();
  const { authUser } = useAuthContext();
  const [{ updateUser }] = useUserHook();

  const mapContainer = useRef<any>(null);
  // Geolocator used to pass to external functions outside useEffect
  const map = useRef<mapBoxGL.Map | null>(null);
  const [currentCoords, setCurrentCoords] = useState<LngLatLike>();

  // Set map loading to true in page load
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  // Custom manual callback to fly to specific coordinates
  const flyTo = useCallback((coords: Coordinates, zoom: number = 15) => {
    map.current?.flyTo({ center: [coords.lng, coords.lat], zoom });
  }, []);

  const updateUserLocation = useCallback(async () => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const coords: Coordinates = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        flyTo(coords);
        if (authUser) await updateUser({ lastLocation: coords });
        setUserInfo(currentInfo => {
          return { ...currentInfo, lastLocation: coords };
        });
      },
      error => {
        console.log('Error geolocating', error);
      },
      { enableHighAccuracy: false },
    );
  }, [authUser, flyTo, setUserInfo, updateUser]);

  const flyToCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    await updateUserLocation();

    map.current?.once('movestart', async () => {
      setLocationLoading(true);
    });
  }, [updateUserLocation]);

  const htmlElement = useMemo(() => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-5 h-5 absolute">
        <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-5 h-5 animate-ping">
        <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
      </svg>`;
  }, []);

  const testElement = useMemo(() => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-6 h-6 absolute">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-6 h-6 animate-ping">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>`;
  }, []);

  const testElement2 = useMemo(() => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-6 h-6 absolute">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <svg class="w-6 h-6 animate-ping" width="15" height="15" viewBox="0 0 15 15" stroke="white" xmlns="http://www.w3.org/2000/svg"><path d="M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
    `;
  }, []);

  // Add HTML marker
  const addMarker = useCallback(
    (htmlElement: string, currentMap: mapBoxGL.Map, coords: LngLatLike) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = htmlElement;

      // make a marker for each feature and add to the map
      new mapBoxGL.Marker(el).setLngLat(coords).addTo(currentMap);
    },
    [],
  );

  const addPerformanceLayer = useCallback(() => {
    // Insert the layer beneath any symbol layer.
    const layers = map.current?.getStyle().layers;
    const labelLayerId = layers?.find(
      layer => layer.type === 'symbol' && layer.layout?.['text-field'],
    )?.id;

    // The 'building' layer in the Mapbox Streets vector tile set contains building height data from OpenStreetMap.
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
  }, []);

  const triggerNorth = useCallback(() => {
    map.current?.resetNorth({ duration: 2000 });
  }, []);

  const triggerPerformance = useCallback(() => {
    if (!mapLoading) {
      setUserInfo(currentInfo => ({
        ...currentInfo,
        performanceMode: !currentInfo?.performanceMode,
      }));
    }
  }, [mapLoading, setUserInfo]);

  // Initial map loading
  useEffect(() => {
    // Prevent re-creating a map if one already exists
    if (map.current) return;

    // Workaround to spawn user near their location rather than in a random location and flying over
    if (userInfo?.lastLocation && 'performanceMode' in userInfo) {
      mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      map.current = new mapBoxGL.Map({
        attributionControl: false,
        container: mapContainer.current,
        style: `${shouldUseDarkMode ? mapStyles.dark : mapStyles.dark}`,
        // Default coords: CN Tower
        center: [userInfo.lastLocation.lng, userInfo.lastLocation.lat],
        zoom: 9,
      });

      // Automatically load geolocator/user's current location (with hidden built-in button)
      const currentGeolocator = new mapBoxGL.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: false,
        },
        trackUserLocation: true,
        showAccuracyCircle: true,
        showUserHeading: true,
      });

      map.current.addControl(currentGeolocator);

      map.current
        .once('style.load', () => {
          setMapLoading(false);
          setLocationLoading(true);
          currentGeolocator.trigger();

          // TODO: current location marker to replace currentGeolocator
          // if (userInfo.lastLocation) {
          //   map.current?.addSource('my location', {
          //     type: 'geojson',
          //     data: {
          //       type: 'Feature',
          //       geometry: {
          //         type: 'Point',
          //         coordinates: [userInfo.lastLocation.lng, userInfo.lastLocation.lat],
          //       },
          //       properties: {
          //         title: 'Mapbox DC',
          //         'marker-symbol': 'monument',
          //       },
          //     },
          //   });
          // }
        })
        .on('moveend', () => {
          if (map.current)
            setCurrentCoords([
              parseFloat(map.current.getCenter().lng.toFixed(4)),
              parseFloat(map.current.getCenter().lat.toFixed(4)),
            ]);
          setLocationLoading(false);
        });

      map.current?.on('click', mouseEvent => {
        if (map.current) {
          addMarker(htmlElement, map.current, mouseEvent.lngLat);
          console.log(mouseEvent.lngLat);
        }
      });
    }
  }, [addMarker, htmlElement, userInfo]);

  useEffect(() => {
    if (!mapLoading) {
      if (!map.current?.getLayer('add-3d-buildings') && userInfo?.performanceMode) {
        addPerformanceLayer();
      } else if (map.current?.getLayer('add-3d-buildings') && !userInfo?.performanceMode) {
        map.current?.removeLayer('add-3d-buildings');
      }
    }
  }, [addPerformanceLayer, mapLoading, userInfo?.performanceMode]);

  // On first map load, or on authUser change
  useEffect(() => {
    if (firstLoading && authUser && userInfo) {
      console.log('On first map load, when authUser gets');
      flyToCurrentLocation().then(() => setFirstLoading(false));
    }
  }, [authUser, firstLoading, flyToCurrentLocation, userInfo]);

  return (
    <div
      className={`overflow-hidden rounded-xl h-full w-full relative drop-shadow-lg bg-slate-800`}
    >
      {/* Actual map */}
      <div className={cn(`w-full h-full`, locationLoading && 'animate-pulse')} ref={mapContainer} />

      {/* Extra layers on map (buttons, controls) */}
      <Controls
        mapLoading={mapLoading}
        locationLoading={locationLoading}
        triggerGeolocator={flyToCurrentLocation}
        triggerNorth={triggerNorth}
        triggerPerformance={triggerPerformance}
      />
    </div>
  );
};

const Controls: FC<{
  mapLoading: boolean;
  locationLoading: boolean;
  triggerGeolocator: () => void;
  triggerNorth: () => void;
  triggerPerformance: () => void;
}> = ({ triggerGeolocator, triggerNorth, triggerPerformance, mapLoading, locationLoading }) => {
  const { userInfo } = useUserContext();

  if (mapLoading)
    return (
      <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
        <Spinner />
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
        {locationLoading ? <Spinner /> : <LocationMarkerIcon />}
      </Button>
    </>
  );
};

export default Map;

// Add HTML marker
// <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2'}>
//   <Spinner />
// </div>