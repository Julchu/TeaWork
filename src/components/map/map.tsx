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

// CN Tower long/lat: [-79.387054, 43.642567]
const Map: FC<{ loadHome?: LngLatLike }> = ({ loadHome }) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapBoxGL.Map | null>(null);
  const [initialCoords, setInitialCoords] = useState<LngLatLike>(loadHome || [-70.9, 42.35]);

  const [currentCoords, setCurrentCoords] = useState<LngLatLike | undefined>(loadHome);
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(9);

  // If needed, debouncing lng/lat to slow down updates whenever map coordinates are moved
  const debouncedLocation = useDebouncedState<LngLatLike>(initialCoords);
  const [loading, setLoading] = useState<boolean>(false);

  // Simple wrapper to trigger loading state
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    setLoading(true);
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
    });
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

  // Custom manual callback to fly to specific coordinates
  const flyTo = useCallback((center: LngLatLike, zoom: number = 15) => {
    map.current?.flyTo({ center, zoom });
  }, []);

  // Flies home and sets marker
  const flyToCurrentLocation = useCallback(async () => {
    setLoading(true);

    if (currentCoords) flyTo(currentCoords, 15);

    try {
      const pos = await getCurrentLocation();
      flyTo([pos.coords.longitude, pos.coords.latitude]);
      setCurrentCoords([pos.coords.longitude, pos.coords.latitude]);

      setLoading(false);
    } catch (err) {
      console.log(`can't get coords because of ${err}`);
    }
  }, [flyTo, getCurrentLocation, currentCoords]);

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
      center: initialCoords,
      zoom,
    });

    // Need to add locator control to set current location marker
    const geolocator = new mapBoxGL.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    map.current?.addControl(geolocator);

    map.current?.on('load', async () => {
      setLoading(true);
      geolocator.trigger();
    });

    geolocator.on('geolocate', () => {
      setLoading(false);
    });
    map.current?.resize();
  }, [flyToCurrentLocation, initialCoords, zoom]);

  // If map exists, trigger tracking map's current location
  useEffect(() => {
    if (map.current) {
      map.current.on('move', () => {
        if (map.current) {
          setInitialCoords([
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
    map.current?.on('load', () => {
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
      <div className={'w-full h-full'} ref={mapContainer} />

      {/* Extra layers on map (buttons, controls) */}
      {firstLoading ? (
        <div className={'absolute top-1/2 bottom-1/2 left-1/2 right-1/2 bg-none'}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Location button */}
          <Button
            className={'absolute bottom-5 right-5 opacity-50 w-[40px] h-[40px] p-0 rounded-full'}
            onClick={flyToCurrentLocation}
          >
            {loading ? <Spinner /> : <LocationMarkerIcon />}
          </Button>
        </>
      )}
    </div>
  );
};

export default Map;

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