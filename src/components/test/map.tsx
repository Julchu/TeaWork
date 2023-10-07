'use client';
import "mapbox-gl/dist/mapbox-gl.css";
import mapBoxGL, { LngLatLike } from "mapbox-gl";
import * as React from "react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import useDebouncedState from "src/hooks/use-debounced-hook";
import { Button } from "src/components/ui/button";
import * as process from "process";
import Spinner from "src/components/ui/spinner";
import LocationMarker from "src/components/ui/location-marker";

/* Other map styles
 * style: 'mapbox://styles/mapbox/streets-v12',
 * style: 'mapbox://styles/mapbox/basic-v8',
 * style: 'mapbox://styles/mapbox/bright-v8',
 * style: 'mapbox://styles/mapbox/satellite-v8',
 * style: 'mapbox://styles/mapbox/outdoors-v12',
 * */
const Map: FC = () => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapBoxGL.Map | null>(null);
  const [lng, setLng] = useState<number>(-70.9);
  const [lat, setLat] = useState<number>(42.35);
  const [home, setHome] = useState<LngLatLike>();
  const [firstLoading, setFirstLoading] = useState<boolean>();

  // If needed, debouncing lng/lat to slow down updates whenever map coordinates are moved
  const debouncedLong = useDebouncedState(lng, 50);
  const debouncedLat = useDebouncedState(lat, 50);
  const [zoom, setZoom] = useState<number>(9);
  const [loading, setLoading] = useState<boolean>(false);

  // Simple wrapper to trigger loading state
  const getPosition = useCallback((): Promise<GeolocationPosition> => {
    setLoading(true);
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
    });
  }, []);

  const flyTo = useCallback((center: LngLatLike, zoom: number = 15) => {
    map.current?.flyTo({ center, zoom });
  }, []);

  const flyHome = useCallback(async () => {
    setLoading(true);

    if (home) flyTo(home, 15);

    try {
      const pos = await getPosition();
      flyTo([pos.coords.longitude, pos.coords.latitude]);
      setHome([pos.coords.longitude, pos.coords.latitude]);
      setLoading(false);
    } catch (err) {
      console.log(`can't get coords because of ${err}`);
    }
  }, [flyTo, getPosition, home]);

  // Initial map loading
  useEffect(() => {
    // Prevent re-creating a map if one already exists
    if (map.current) return;
    mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    map.current = new mapBoxGL.Map({
      attributionControl: false,
      container: mapContainer.current,
      // style: 'mapbox://styles/jchumtl/clnfdhrsc080001qi3ye8e8mj',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom,
    });
  }, [lat, lng, zoom]);

  // Additional map stylings
  useEffect(() => {
    // If map exists, trigger tracking map's current location
    if (map.current) {
      map.current.on('move', () => {
        if (map.current) {
          setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
          setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.on('style.load', () => {
        // Insert the layer beneath any symbol layer.
        const layers = map.current?.getStyle().layers;
        const labelLayerId = layers?.find(
          layer => layer.type === 'symbol' && layer.layout?.['text-field'],
        )?.id;

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
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
    }
  }, []);

  useEffect(() => {
    setFirstLoading(true);
    map.current?.on('load', () => {
      setFirstLoading(false);
    });
  }, []);

  return (
    <>
      <div className={'w-full h-full drop-shadow-2xl'} ref={mapContainer} />
      {firstLoading ? (
        <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
          <Spinner />
        </div>
      ) : (
        <>
          <Button
            className={'absolute top-5 right-5 opacity-50 w-[40px] h-[40px] p-0 rounded-full'}
            onClick={flyHome}
          >
            {loading ? <Spinner /> : <LocationMarker />}
          </Button>
        </>
      )}
    </>
  );
};

export default Map;

//
// <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2'}>
//   <Spinner />
// </div>