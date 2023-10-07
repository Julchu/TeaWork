'use client';
import "mapbox-gl/dist/mapbox-gl.css";
import mapBoxGL, { LngLatLike } from "mapbox-gl";
import * as React from "react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import * as process from "process";
import useDebouncedState from "src/hooks/use-debounced-hook";
import Spinner from "src/components/ui/spinner";
import { Button } from "src/components/ui/button";

/* Other map styles
 * style: 'mapbox://styles/mapbox/streets-v12',
 * style: 'mapbox://styles/mapbox/basic-v8',
 * style: 'mapbox://styles/mapbox/bright-v8',
 * style: 'mapbox://styles/mapbox/satellite-v8',
 * */
const Map: FC = () => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapBoxGL.Map | null>(null);
  const [lng, setLng] = useState<number>(-70.9);
  const [lat, setLat] = useState<number>(42.35);
  const [home, setHome] = useState<LngLatLike>();

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

    if (home) flyTo(home, 5);

    try {
      const pos = await getPosition();
      flyTo([pos.coords.longitude, pos.coords.latitude]);
      setHome([pos.coords.longitude, pos.coords.latitude]);
      setLoading(false);
    } catch (err) {
      console.log(`can't get coords because of ${err}`);
    }
  }, [flyTo, getPosition, home]);

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
    } else {
      // Prevent re-creating a map if one already exists
      mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      map.current = new mapBoxGL.Map({
        attributionControl: false,
        container: mapContainer.current,
        style: 'mapbox://styles/jchumtl/clnfdhrsc080001qi3ye8e8mj',
        center: [lng, lat],
        zoom: zoom,
      }).addControl(
        new mapBoxGL.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          // When active the map will receive updates to the device's location as it changes.
          trackUserLocation: true,
          // Draw an arrow next to the location dot to indicate which direction the device is heading.
          showUserHeading: true,
        }),
      );
    }
  }, [lat, lng, zoom]);

  return (
    <div className={'overflow-hidden rounded-2xl h-full w-full relative bg-pink-600'}>
      <div className={'w-full h-full'} ref={mapContainer} />
      <Button className={'absolute top-5 right-5 opacity-50'} onClick={flyHome}>
        {loading ? <Spinner /> : <h1>Get Current Location</h1>}
      </Button>
    </div>
  );
};

export default Map;