import mapBoxGL from 'mapbox-gl';
import { MutableRefObject, useCallback, useMemo, useState } from 'react';
import { useUserContext } from 'src/hooks/use-user-context';

type MapMethods = {
  triggerGeolocator: () => void;
  triggerNorth: () => void;
  triggerPerformance: (mapLoading: boolean) => void;
  triggerPink: () => void;
  addPerformanceLayer: () => void;
  mapStyles: Record<string, string>;
};

const useMapHook = (
  map: MutableRefObject<mapBoxGL.Map | null>,
  mapLoading: boolean,
): [MapMethods, boolean, Error | undefined] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { userInfo, setUserInfo } = useUserContext();

  const mapStyles = useMemo(() => {
    return {
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
  }, []);

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
  }, [map]);

  const triggerGeolocator = useCallback<MapMethods['triggerGeolocator']>(() => {
    return;
  }, []);

  const triggerNorth = useCallback<MapMethods['triggerNorth']>(() => {
    map.current?.resetNorth({ duration: 2000 });
  }, [map]);

  const triggerPerformance = useCallback<MapMethods['triggerPerformance']>(() => {
    if (!mapLoading) {
      setUserInfo(currentInfo => ({
        ...currentInfo,
        performanceMode: !currentInfo?.performanceMode,
      }));
    }
  }, [mapLoading, setUserInfo]);

  const triggerPink = useCallback<MapMethods['triggerPink']>(() => {
    if (!mapLoading) {
      map.current?.setStyle(mapStyles.light);
      map.current?.on('style.load', () => {
        if (userInfo?.performanceMode) {
          addPerformanceLayer();
          map.current?.triggerRepaint();
          map.current?.resize();
          // map.current?.setLight({color: 'red'})
        }
      });
    }
  }, [addPerformanceLayer, map, mapLoading, mapStyles.light, userInfo?.performanceMode]);

  return [
    {
      addPerformanceLayer,
      triggerGeolocator,
      triggerNorth,
      triggerPerformance,
      triggerPink,
      mapStyles,
    },
    loading,
    error,
  ];
};

export default useMapHook;