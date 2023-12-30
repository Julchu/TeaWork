'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';
import mapBoxGL, { Marker } from 'mapbox-gl';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as process from 'process';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { Coordinates } from 'src/lib/firebase/interfaces';
import Controls from 'src/components/map/controls';
import useMapHook from 'src/hooks/use-map-hook';

// CN Tower long/lat: [-79.387054, 43.642567]
const Map: FC<{
  shouldUseDarkMode: boolean;
  initialCoords: Coordinates;
  headerStore?: any;
}> = ({ shouldUseDarkMode, initialCoords, headerStore }) => {
  const { authUser, authLoading, userInfo, setUserInfo, userLoading, setUserLoading } =
    useAuthContext();
  // const [userLoading, setUserLoading]
  const [{ updateUser }] = useUserHook();
  const map = useRef<mapBoxGL.Map | null>(null);
  // Set map loading to true in page load
  const [mapLoading, setMapLoading] = useState<boolean>(true);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  // Geolocator used to pass to external functions outside useEffect
  const [viewingCoords, setViewingCoords] = useState<Coordinates>();
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  const [currentMarker, setCurrentMarker] = useState<Marker>();

  const [{ mapStyles, markers, addMarker, togglePerformanceLayer, removePerformanceLayer, flyTo }] =
    useMapHook(map, mapLoading, setMapLoading, shouldUseDarkMode);

  const updateUserLocation = useCallback(
    async (coords: Coordinates) => {
      if (userInfo) await updateUser({ lastLocation: coords });
      setUserInfo(currentInfo => {
        return { ...currentInfo, lastLocation: coords };
      });
    },
    [userInfo, setUserInfo, updateUser],
  );

  const flyAndUpdateUser = useCallback(
    async (save?: boolean) => {
      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async pos => {
          const coords: Coordinates = { lng: pos.coords.longitude, lat: pos.coords.latitude };

          flyTo(coords);

          await updateUserLocation(coords);

          if (map.current)
            addMarker(markers['location'], currentMarker, setCurrentMarker, coords, save);

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
    [addMarker, currentMarker, flyTo, markers, updateUserLocation],
  );

  // Initial map loading and base map event listeners that persist
  useEffect(() => {
    if (!map.current && mapContainer.current !== undefined && mapContainer.current !== null) {
      mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      map.current = new mapBoxGL.Map({
        attributionControl: false,
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {},
          layers: [],
        },
        center: [-79.387054, 43.642567],
        // center: [initialCoords.lng, initialCoords.lat],
        zoom: 17,
        antialias: true,
      })
        .on('idle', () => {
          if (map.current?.isStyleLoaded()) {
            setMapLoading(false);
          }
        })
        // Gets currently-viewing coordinates
        .on('moveend', () => {
          if (map.current)
            setViewingCoords({
              lng: parseFloat(map.current.getCenter().lng.toFixed(4)),
              lat: parseFloat(map.current.getCenter().lat.toFixed(4)),
            });
          setLocationLoading(false);
        }) // Click marker event listeners
        .on('click', mouseEvent => {
          addMarker(markers['location'], currentMarker, setCurrentMarker, mouseEvent.lngLat);
          console.log(mouseEvent.lngLat);
        });
    }
  }, [addMarker, currentMarker, initialCoords.lat, initialCoords.lng, markers]);

  // Setting map styles
  useEffect(() => {
    if (map.current) {
      if (userInfo?.mapStyle && !userLoading && !authLoading) {
        map.current.setStyle(mapStyles[userInfo?.mapStyle]);
      } else {
        map.current?.setStyle(mapStyles.default);
      }
    }
  }, [authLoading, mapStyles, userInfo?.mapStyle, userLoading]);

  // Setting initial performance mode whenever style changes or page loads
  useEffect(() => {
    if (map.current)
      if (userInfo?.performanceMode && !userLoading && !authLoading) {
        map.current.once('style.load', () => {
          togglePerformanceLayer(userInfo.performanceMode);
        });
      }
  }, [authLoading, togglePerformanceLayer, userInfo?.performanceMode, userLoading]);

  useEffect(() => {
    togglePerformanceLayer(userInfo?.performanceMode);
  }, [togglePerformanceLayer, userInfo?.performanceMode]);

  // Setting initial location
  useEffect(() => {
    if (userInfo?.lastLocation && map.current)
      addMarker(markers['home'], currentMarker, setCurrentMarker, userInfo.lastLocation, true);
    else {
      currentMarker?.remove();
      setCurrentMarker(undefined);
    }
  }, [addMarker, currentMarker, markers, userInfo?.lastLocation]);

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
        setMapLoading={setMapLoading}
        locationLoading={locationLoading}
        triggerGeolocator={flyAndUpdateUser}
        shouldUseDarkMode={shouldUseDarkMode}
      />
    </div>
  );
};

export default Map;