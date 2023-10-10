'use client';
import "mapbox-gl/dist/mapbox-gl.css";
import mapBoxGL, { LngLatLike } from "mapbox-gl";
import * as React from "react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import useDebouncedState from "src/hooks/use-debounced-hook";
import { Button } from "src/components/ui/button";
import * as process from "process";
import Spinner from "src/components/ui/spinner";
// import
import { LocationMarkerIcon } from "src/components/ui/icons/location-marker";
import "./map.css";

/* Other map styles
 * style: 'mapbox://styles/mapbox/streets-v12',
 * style: 'mapbox://styles/mapbox/basic-v8',
 * style: 'mapbox://styles/mapbox/bright-v8',
 * style: 'mapbox://styles/mapbox/satellite-v8',
 * style: 'mapbox://styles/mapbox/outdoors-v12',
 * */
const Map: FC<{ loadHome?: LngLatLike }> = ({ loadHome }) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapBoxGL.Map | null>(null);
  const [currentCoords, setCurrentCoords] = useState<LngLatLike>(loadHome || [-70.9, 42.35]);

  const [home, setHome] = useState<LngLatLike | undefined>(loadHome);
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(9);

  // If needed, debouncing lng/lat to slow down updates whenever map coordinates are moved
  const debouncedLocation = useDebouncedState<LngLatLike>(currentCoords);
  const [loading, setLoading] = useState<boolean>(false);

  // Simple wrapper to trigger loading state
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    setLoading(true);
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
    });
  }, []);

  // Custom manual callback to fly to specific coordinates
  const flyTo = useCallback((center: LngLatLike, zoom: number = 15) => {
    map.current?.flyTo({ center, zoom });
  }, []);

  const flyHome = useCallback(async () => {
    setLoading(true);

    if (home) flyTo(home, 15);

    try {
      const pos = await getCurrentLocation();
      flyTo([pos.coords.longitude, pos.coords.latitude]);
      setHome([pos.coords.longitude, pos.coords.latitude]);
      setLoading(false);
    } catch (err) {
      console.log(`can't get coords because of ${err}`);
    }
  }, [flyTo, getCurrentLocation, home]);

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
      center: currentCoords,
      zoom,
    });
    map.current.resize();
    flyHome().then(() => {
      setLoading(false);
    });

    const geolocator = new mapBoxGL.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    map.current.addControl(geolocator);

    map.current.on('load', () => {
      geolocator.trigger();
    });
  }, [flyHome, currentCoords, zoom, home, getCurrentLocation]);

  // If map exists, trigger tracking map's current location
  useEffect(() => {
    if (map.current) {
      map.current.on('move', () => {
        if (map.current) {
          setCurrentCoords([
            parseFloat(map.current.getCenter().lng.toFixed(4)),
            parseFloat(map.current.getCenter().lat.toFixed(4)),
          ]);
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        }
      });
    }
  }, []);

  // Loading 3-D building styles
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
    map.current?.on('load', async () => {
      setFirstLoading(false);
    });
  }, []);

  return (
    <div
      className={
        'overflow-hidden rounded-xl h-full w-full relative drop-shadow-lg bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200'
      }
    >
      {/* Actual map */}
      <div className={'w-full h-full drop-shadow-2xl'} ref={mapContainer} />

      {/* Extra layers on map (buttons, controls) */}
      {firstLoading ? (
        <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Location button */}
          <Button
            className={'absolute top-5 right-5 opacity-50 w-[40px] h-[40px] p-0 rounded-full'}
            onClick={flyHome}
          >
            {loading ? <Spinner /> : <LocationMarkerIcon />}
          </Button>
        </>
      )}
    </div>
  );
};

export default Map;

//
// <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2'}>
//   <Spinner />
// </div>