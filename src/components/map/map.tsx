'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';
import mapBoxGL, { Marker } from 'mapbox-gl';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as process from 'process';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { useUserContext } from 'src/hooks/use-user-context';
import { Coordinates } from 'src/lib/firebase/interfaces';
import Controls from 'src/components/map/controls';
import useMapHook from 'src/hooks/use-map-hook';

// CN Tower long/lat: [-79.387054, 43.642567]
const Map: FC<{
  shouldUseDarkMode: boolean;
  initialCoords: Coordinates;
}> = ({ shouldUseDarkMode, initialCoords }) => {
  const { userInfo, setUserInfo } = useUserContext();
  const { authUser } = useAuthContext();
  const [{ updateUser }] = useUserHook();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  // Geolocator used to pass to external functions outside useEffect
  const map = useRef<mapBoxGL.Map | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates>();
  const [viewingCoords, setViewingCoords] = useState<Coordinates>();

  // Set map loading to true in page load
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  const [currentMarker, setCurrentMarker] = useState<Marker>();

  const [{ mapStyles, addMarker, addPerformanceLayer, flyTo }] = useMapHook(map, mapLoading);

  const locationMarker = useMemo(() => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="" class="w-5 h-5 absolute fill-blue-600">
        <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="" class="w-5 h-5 animate-ping ${
        shouldUseDarkMode ? 'fill-blue-600' : 'fill-blue-600'
      }">
        <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
      </svg>`;
  }, [shouldUseDarkMode]);

  const updateUserLocation = useCallback(
    async (coords: Coordinates) => {
      if (authUser) await updateUser({ lastLocation: coords });
      setUserInfo(currentInfo => {
        return { ...currentInfo, lastLocation: coords };
      });
    },
    [authUser, setUserInfo, updateUser],
  );

  const flyAndUpdateUser = useCallback(
    async (save?: boolean) => {
      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async pos => {
          const coords: Coordinates = { lng: pos.coords.longitude, lat: pos.coords.latitude };

          flyTo(coords);

          await updateUserLocation(coords);

          if (map.current) addMarker(locationMarker, currentMarker, setCurrentMarker, coords, save);

          map.current?.once('movestart', async () => {
            setLocationLoading(true);
          });
        },
        error => {
          console.log('Error geolocating', error);
        },
        { enableHighAccuracy: false },
      );
    },
    [addMarker, currentMarker, flyTo, locationMarker, updateUserLocation],
  );

  // Initial map loading
  useEffect(() => {
    // Prevent re-creating a map if one already exists
    if (map.current) return;

    // Workaround to spawn user near their location rather than in a random location and flying over
    mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapBoxGL.Map({
      attributionControl: false,
      container:
        mapContainer.current === undefined || mapContainer.current === null
          ? ''
          : mapContainer.current,
      style: `${shouldUseDarkMode ? mapStyles.dark : mapStyles.light}`,
      center: [initialCoords.lng, initialCoords.lat],
      zoom: 9,
    });

    map.current
      .once('style.load', () => setMapLoading(false))
      .on('moveend', () => {
        if (map.current)
          setViewingCoords({
            lng: parseFloat(map.current.getCenter().lng.toFixed(4)),
            lat: parseFloat(map.current.getCenter().lat.toFixed(4)),
          });
        setLocationLoading(false);
      });

    map.current?.on('click', mouseEvent => {
      // mouseEvent.originalEvent?..;
      if (map.current) {
        addMarker(locationMarker, currentMarker, setCurrentMarker, mouseEvent.lngLat);
        console.log(mouseEvent.lngLat);
      }
    });
  }, [
    addMarker,
    currentMarker,
    initialCoords.lat,
    initialCoords.lng,
    locationMarker,
    mapStyles.dark,
    mapStyles.light,
    shouldUseDarkMode,
  ]);

  // Performance layer based on user preferences
  useEffect(() => {
    if (!mapLoading) {
      if (!map.current?.getLayer('add-3d-buildings') && userInfo?.performanceMode) {
        addPerformanceLayer();
      } else if (map.current?.getLayer('add-3d-buildings') && !userInfo?.performanceMode) {
        map.current?.removeLayer('add-3d-buildings');
      }
    }
  }, [addPerformanceLayer, mapLoading, userInfo?.performanceMode]);

  // Setting initial location
  useEffect(() => {
    if (userInfo?.lastLocation && map.current) {
      addMarker(locationMarker, currentMarker, setCurrentMarker, userInfo.lastLocation, true);
    }
  }, [addMarker, currentMarker, locationMarker, userInfo?.lastLocation]);

  return (
    <div
      className={`overflow-hidden rounded-xl h-full w-full relative drop-shadow-lg ${
        shouldUseDarkMode ? 'bg-slate-800' : 'bg-gray-100'
      }`}
    >
      {/* Actual map */}
      <div
        className={`w-full h-full ${locationLoading ? 'animate-pulse' : ''}`}
        ref={mapContainer}
      />

      {/* Extra layers on map (buttons, controls) */}
      <Controls
        map={map}
        mapLoading={mapLoading}
        locationLoading={locationLoading}
        triggerGeolocator={flyAndUpdateUser}
        shouldUseDarkMode={shouldUseDarkMode}
      />
    </div>
  );
};

export default Map;