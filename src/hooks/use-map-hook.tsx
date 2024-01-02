import mapBoxGL from 'mapbox-gl';
import { Dispatch, MutableRefObject, SetStateAction, useCallback, useMemo, useState } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { Coordinates } from 'src/lib/firebase/interfaces';
import useUserHook from 'src/hooks/use-user-firestore-hook';

type MapMethods = {
  triggerGeolocator: () => void;
  triggerNorth: () => void;
  updatePerformance: () => Promise<void>;
  addMarker: (
    htmlElement: string,
    currentMarker: mapBoxGL.Marker | undefined,
    setCurrentMarker: (marker: mapBoxGL.Marker | undefined) => void,
    coords: Coordinates,
    save?: boolean,
  ) => void;
  togglePerformanceLayer: (toggleOn?: boolean) => void;
  removePerformanceLayer: () => void;
  addPerformanceLayer: () => void;
  flyTo: (coords: Coordinates, zoom?: number) => void;
  mapStyles: Record<string, string>;
  markers: Record<string, string>;
};

const useMapHook = (
  map: MutableRefObject<mapBoxGL.Map | null>,
  mapLoading: boolean,
  setMapLoading: Dispatch<SetStateAction<boolean>>,
  shouldUseDarkMode?: boolean,
): [MapMethods, boolean, Error | undefined] => {
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { userInfo } = useAuthContext();
  const [{ updateUser }] = useUserHook();

  const mapStyles = useMemo(() => {
    return {
      streets: 'mapbox://styles/mapbox/streets-v12',
      basic: 'mapbox://styles/mapbox/basic-v8',
      bright: 'mapbox://styles/mapbox/bright-v8',
      grey: shouldUseDarkMode
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
      satelliteStreets: 'mapbox://styles/mapbox/satellite-v9',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      nav: shouldUseDarkMode
        ? `mapbox://styles/mapbox/navigation-night-v1`
        : `mapbox://styles/mapbox/navigation-day-v1`,
      pink: 'mapbox://styles/jchumtl/clnfdhrsc080001qi3ye8e8mj',
      standard: 'mapbox://styles/mapbox/standard',
    };
  }, [shouldUseDarkMode]);

  const markers = useMemo(() => {
    return {
      location: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-5 h-5 fill-blue-600 absolute">
                  <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-5 h-5 fill-blue-600 animate-ping">
                  <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
                </svg>`,

      home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-5 h-5 fill-blue-600 absolute">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-5 h-5 fill-blue-600 animate-ping">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>`,
    };
  }, []);

  // Add or replace (if save) current HTML marker
  const addMarker = useCallback<MapMethods['addMarker']>(
    (
      htmlElement: string,
      currentMarker: mapBoxGL.Marker | undefined,
      setCurrentMarker: (marker: mapBoxGL.Marker | undefined) => void,
      coords: Coordinates,
      save?: boolean,
    ) => {
      if (!map.current) return;
      const element = document.createElement('div');
      element.className = 'marker';
      element.innerHTML = htmlElement;

      // make a marker for each feature and add to the map
      const marker = new mapBoxGL.Marker({
        element,
        draggable: !save,
        clickTolerance: 40,
      }).setLngLat([coords.lng, coords.lat]);

      // Save current home location
      if (save) {
        if (currentMarker) {
          // currentMarker.remove();
          // setCurrentMarker(undefined);
          // marker.addTo(map.current);
          currentMarker.setLngLat([coords.lng, coords.lat]);
        } else {
          setCurrentMarker(marker);
          marker.addTo(map.current);
        }
      } else marker.addTo(map.current);
    },
    [map],
  );

  // Custom manual callback to fly to specific coordinates
  const flyTo = useCallback<MapMethods['flyTo']>(
    (coords: Coordinates, zoom: number = 15) => {
      map.current?.flyTo({ center: [coords.lng, coords.lat], zoom });
    },
    [map],
  );

  const removePerformanceLayer = useCallback<MapMethods['removePerformanceLayer']>(() => {
    if (map.current && !mapLoading) map.current?.removeLayer('add-3d-buildings');
  }, [map, mapLoading]);

  const addPerformanceLayer = useCallback<MapMethods['addPerformanceLayer']>(() => {
    if (map.current && !mapLoading) {
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
            // 'fill-extrusion-color': '#aaa', // Grey
            // 'fill-extrusion-color': '#d0b47c', // Yellow
            'fill-extrusion-color': 'rgb(37, 99, 235)', // Blue

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
            'fill-extrusion-opacity': 1,
          },
        },
        labelLayerId,
      );
    }
  }, [map, mapLoading]);

  const togglePerformanceLayer = useCallback<MapMethods['togglePerformanceLayer']>(
    toggleOn => {
      if (map.current && !mapLoading) {
        if (toggleOn && !map.current?.getLayer('add-3d-buildings')) addPerformanceLayer();
        if (!toggleOn && map.current?.getLayer('add-3d-buildings')) removePerformanceLayer();
      }
    },
    [addPerformanceLayer, map, mapLoading, removePerformanceLayer],
  );

  const triggerGeolocator = useCallback<MapMethods['triggerGeolocator']>(() => {
    return;
  }, []);

  const triggerNorth = useCallback<MapMethods['triggerNorth']>(() => {
    map.current?.resetNorth({ duration: 2000 });
  }, [map]);

  const updatePerformance = useCallback<MapMethods['updatePerformance']>(async () => {
    if (map.current && userInfo) await updateUser({ performanceMode: !userInfo.performanceMode });
  }, [map, updateUser, userInfo]);

  return [
    {
      addMarker,
      flyTo,
      togglePerformanceLayer,
      addPerformanceLayer,
      removePerformanceLayer,
      triggerGeolocator,
      triggerNorth,
      updatePerformance,
      mapStyles,
      markers,
    },
    userLoading,
    error,
  ];
};

export default useMapHook;