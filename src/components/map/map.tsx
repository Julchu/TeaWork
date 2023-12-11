'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';
import mapBoxGL, { Marker } from 'mapbox-gl';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
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
  headerStore?: any;
}> = ({ shouldUseDarkMode, initialCoords, headerStore }) => {
  const { userInfo, setUserInfo, userLoading } = useUserContext();
  const { authUser, authLoading } = useAuthContext();
  const [{ updateUser }] = useUserHook();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  // Geolocator used to pass to external functions outside useEffect
  const map = useRef<mapBoxGL.Map | null>(null);
  const [viewingCoords, setViewingCoords] = useState<Coordinates>();

  // Set map loading to true in page load
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  const [currentMarker, setCurrentMarker] = useState<Marker>();

  const [{ mapStyles, markers, addMarker, addPerformanceLayer, flyTo }] = useMapHook(
    map,
    mapLoading,
    shouldUseDarkMode,
  );

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

  // Initial map loading
  useEffect(() => {
    if (!map.current && !userLoading && userInfo) {
      mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      map.current = new mapBoxGL.Map({
        attributionControl: false,
        container:
          mapContainer.current === undefined || mapContainer.current === null
            ? ''
            : mapContainer.current,
        style: userInfo?.mapStyle ? mapStyles[userInfo.mapStyle] : mapStyles.default,
        center: [initialCoords.lng, initialCoords.lat],
        zoom: 9,
      });
    }
  }, [initialCoords.lat, initialCoords.lng, mapStyles, mapStyles.default, userInfo, userLoading]);

  useEffect(() => {
    if (map.current) {
      map.current
        .once('style.load', () => setMapLoading(false))
        // Gets currently-viewing coordinates
        .on('moveend', () => {
          if (map.current)
            setViewingCoords({
              lng: parseFloat(map.current.getCenter().lng.toFixed(4)),
              lat: parseFloat(map.current.getCenter().lat.toFixed(4)),
            });
          setLocationLoading(false);
        });

      // Add updated v7 vector/composite source for loading buildings
      map.current.once('style.load', () => {
        if (!map.current?.getSource('composite'))
          map.current?.addSource('composite', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v7',
          });
      });

      // Mapbox V3 style colors
      // map.current.on('style.load', () => {
      //   // @ts-ignore; TODO: check if setConfigProperty added to mapbox-gl type
      //   map.current.setConfigProperty('basemap', 'lightPreset', `${'dusk'}`);
      // });

      map.current?.on('click', mouseEvent => {
        // mouseEvent.originalEvent?..;
        if (map.current) {
          addMarker(markers['location'], currentMarker, setCurrentMarker, mouseEvent.lngLat);
          console.log(mouseEvent.lngLat);
        }
      });
    }
  }, [
    addMarker,
    addPerformanceLayer,
    currentMarker,
    mapStyles,
    markers,
    userInfo?.mapStyle,
    userInfo?.performanceMode,
  ]);

  // Setting initial location
  useEffect(() => {
    if (userInfo?.lastLocation && map.current) {
      addMarker(markers['home'], currentMarker, setCurrentMarker, userInfo.lastLocation, true);
    }
  }, [addMarker, currentMarker, markers, userInfo?.lastLocation]);

  // TODO: fix performance layer to work with switching map style
  // Performance layer based on user preferences
  useEffect(() => {
    if (map.current && userInfo?.performanceMode) {
      if (!map.current?.getLayer('add-3d-buildings')) {
        addPerformanceLayer();
      }
    }
  }, [addPerformanceLayer, userInfo?.performanceMode]);

  // Setting map style based on settings; requires separate check from performance-only layer check
  useEffect(() => {
    if (userInfo && userInfo?.mapStyle && map.current && map.current?.isStyleLoaded()) {
      map.current?.setStyle(mapStyles[userInfo?.mapStyle]);
      if (userInfo.performanceMode && !map.current?.getLayer('add-3d-buildings')) {
        addPerformanceLayer();
      }
    }
  }, [addPerformanceLayer, mapStyles, userInfo]);

  return (
    <div
      className={`overflow-hidden rounded-xl h-full w-full relative drop-shadow-lg ${
        shouldUseDarkMode ? 'bg-slate-800' : 'bg-gray-100'
      }`}
    >
      <div>{JSON.stringify(headerStore)}</div>
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