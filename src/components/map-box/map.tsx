'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';
import mapBoxGL, { Map, Marker } from 'mapbox-gl';
// import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as process from 'process';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { Coordinates, MapStyle, MapTime } from 'src/lib/firebase/interfaces';
import Controls from 'src/components/map-box/controls';
import useMapHook from 'src/hooks/use-map-hook';
import useDebouncedState from 'src/hooks/use-debounced-hook';
import { Button } from 'src/components/ui/button';

// CN Tower long/lat: [-79.387054, 43.642567]
const MapBoxMap: FC<{
  shouldUseDarkMode: boolean;
  mapTimeMode: MapTime;
  initialCoords: Coordinates;
}> = ({ shouldUseDarkMode, initialCoords, mapTimeMode }) => {
  const { authUser, authLoading, userInfo, setUserInfo, userLoading, setUserLoading } =
    useAuthContext();
  // const [userLoading, setUserLoading]
  const [{ updateUser }] = useUserHook();
  const map = useRef<Map | null>(null);
  // Set map loading to true in page load
  const [mapLoading, setMapLoading] = useState<boolean>(true);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  // Geolocator used to pass to external functions outside useEffect
  const [viewingCoords, setViewingCoords] = useState<Coordinates>();
  const debouncedViewingCoords = useDebouncedState(viewingCoords);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle>();
  const [currentPerfMode, setCurrentPerfMode] = useState<boolean | undefined>(false);

  const [currentMarker, setCurrentMarker] = useState<Marker>();

  const [{ mapStyles, markers, addMarker, togglePerformanceLayer, removePerformanceLayer, flyTo }] =
    useMapHook(map, mapLoading, setMapLoading, shouldUseDarkMode, mapTimeMode);

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

          if (map.current)
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
    if (!map.current && mapContainer.current !== null) {
      mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      map.current = new Map({
        attributionControl: false,
        container: mapContainer.current || '',
        style: {
          version: 8,
          sources: {},
          layers: [],
        },
        center: [initialCoords.lng, initialCoords.lat],
        zoom: 9,
        antialias: true,
      })
        .on('idle', () => setMapLoading(false))
        .on('styledata', () => setMapLoading(false))
        // Gets currently-viewing coordinates
        .on('moveend', () => {
          const lng = map.current?.getCenter().lng.toFixed(4);
          const lat = map.current?.getCenter().lat.toFixed(4);
          if (lng && lat)
            setViewingCoords({
              lng: parseFloat(lng),
              lat: parseFloat(lat),
            });
          setLocationLoading(false);
        }) // Click marker event listeners
        .on('click', mouseEvent => {
          addMarker(markers['location'], currentMarker, setCurrentMarker, mouseEvent.lngLat);
          console.log(mouseEvent.lngLat);
        });
    }
  }, [addMarker, currentMarker, initialCoords.lat, initialCoords.lng, markers]);

  const searchNearby = useCallback(async (coordinates: Coordinates) => {
    const results = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/forward?&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&q=cafe&proximity=${coordinates.lng},${coordinates.lat}`,
    );
    return await results.json();
  }, []);

  /*
    Bakery,Restaurant,Pub,Cafe,Memorial,Playground,Library,Convenience_Store,Supermarket,Social_Facility,Tourist_Attraction,Bar,Hotel,Museum,Hostel,Community_Garden,Community_Center,Marketplace,Picnic_Site,Fast_Food,
]
  * */

  // const searchCategoryNearby = useCallback(async (coordinates: Coordinates) => {
  //   const results = await fetch(
  //     `https://api.mapbox.com/search/searchbox/v1/category/coffee?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&proximity=${coordinates.lng},${coordinates.lat}&poi_category=bakery,restaurant,pub,cafe,memorial,playground,library,convenience_store,supermarket,social_facility,tourist_attraction,bar,hotel,museum,hostel,community_garden,community_center,marketplace,picnic_site,fast_food`,
  //   );
  //   return await results.json();
  // }, []);

  const filterCategory = useCallback(() => {
    if (map.current) {
      const layers = map.current.style._mergedLayers;

      for (const layerId in layers) {
        if (layerId.includes('poi-label')) {
          const layer = map.current.style._mergedLayers[layerId];
          layer.filter = [
            'any',
            ['==', 'category_en', 'Restaurant'],
            ['==', 'category_en', 'Cafe'],
            ['==', 'category_en', 'Bakery'],
            ['==', 'category_en', 'Library'],
            ['==', 'category_en', 'Convenience_Store'],
            ['==', 'category_en', 'Supermarket'],
            ['==', 'category_en', 'Bar'],
            ['==', 'category_en', 'Community_Garden'],
            ['==', 'category_en', 'Picnic_Site'],
            ['==', 'category_en', 'Fast_Food'],
          ];
          map.current.style._updateLayer(layer);
        }
      }
      map.current._update(true);
    }
  }, []);

  // useEffect(() => {
  //   if (debouncedViewingCoords) {
  //     console.log('debounced', debouncedViewingCoords);
  //     searchCategoryNearby(debouncedViewingCoords).then(results => {
  //       console.log('results', results);
  //     });
  //   }
  // }, [debouncedViewingCoords, searchCategoryNearby]);

  // Setting map styles
  useEffect(() => {
    if (map.current) {
      if (userInfo !== undefined) {
        if (userInfo.mapStyle && userInfo?.mapStyle !== currentMapStyle) {
          map.current.setStyle(mapStyles[userInfo?.mapStyle]);
          setCurrentMapStyle(userInfo?.mapStyle);
        } else if (!mapLoading && !currentMapStyle) {
          map.current?.setStyle(mapStyles.standard);
          setCurrentMapStyle(MapStyle.standard);
        }
      }
    }
  }, [currentMapStyle, mapLoading, mapStyles, userInfo]);

  // Setting performance mode when user toggles perf mode
  useEffect(() => {
    if (map.current) {
      if (userInfo?.performanceMode !== currentPerfMode) {
        togglePerformanceLayer(userInfo?.performanceMode);
        setCurrentPerfMode(userInfo?.performanceMode);
      }
    }
  }, [currentPerfMode, togglePerformanceLayer, userInfo?.performanceMode]);

  // Setting performance mode after style changes or page loads
  useEffect(() => {
    if (map.current)
      if (userInfo?.performanceMode !== currentPerfMode) {
        map.current.on('style.load', () => {
          togglePerformanceLayer(userInfo?.performanceMode);
          setCurrentPerfMode(userInfo?.performanceMode);
        });
      }
  }, [currentPerfMode, togglePerformanceLayer, userInfo?.performanceMode]);

  // Setting initial location
  // TODO: change current marker icon
  useEffect(() => {
    if (map.current && userInfo?.lastLocation)
      addMarker(markers['home'], currentMarker, setCurrentMarker, userInfo.lastLocation, true);
    else {
      currentMarker?.remove();
      setCurrentMarker(undefined);
    }
  }, [addMarker, currentMarker, markers, userInfo?.lastLocation]);

  return (
    <div
      className={`overflow-hidden h-full w-full relative drop-shadow-lg ${
        shouldUseDarkMode ? 'bg-slate-800' : 'bg-gray-100'
      }`} // Full screen margin change: rounded-xl
    >
      <Button
        onClick={filterCategory}
        className={'absolute top-56 left-56 z-50 bg-green-950 w-[40px] h-[40px] p-0 rounded-full'}
      />
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

export default MapBoxMap;