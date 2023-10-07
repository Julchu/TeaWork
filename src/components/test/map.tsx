'use client';
import "mapbox-gl/dist/mapbox-gl.css";
import mapBoxGL from "mapbox-gl";
import * as React from "react";
import { FC, Suspense, useEffect, useRef, useState } from "react";
import { Button } from "src/components/ui/button";
import * as process from "process";
import Spinner from "src/components/ui/spinner";
import useDebouncedState from "src/hooks/use-debounced-hook";

/* Other map styles
 * style: 'mapbox://styles/mapbox/streets-v12',
 * style: 'mapbox://styles/mapbox/basic-v8',
 * style: 'mapbox://styles/mapbox/bright-v8',
 * */
const Map: FC = () => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapBoxGL.Map | null>(null);
  const [lng, setLng] = useState<number>(-70.9);
  const [lat, setLat] = useState<number>(42.35);

  // If needed, debouncing lng/lat to slow down updates whenever map coordinates are moved
  const debouncedLong = useDebouncedState(lng, 50);
  const debouncedLat = useDebouncedState(lat, 50);
  const [zoom, setZoom] = useState<number>(9);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(position => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);

        mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
        map.current = new mapBoxGL.Map({
          attributionControl: false,
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v8',
          center: [lng, lat],
          zoom: zoom,
        });
      });
      setLoading(false);
    }

    if (map.current) {
      map.current.on('move', () => {
        if (map.current) {
          setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
          setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        }
      });
    }
  }, [lat, lng, zoom]);

  useEffect(() => {
    console.log('lat:', debouncedLat, 'long:', debouncedLong);
  }, [debouncedLat, debouncedLong, lat, lng]);

  const flyTo = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        // setCenter([pos.coords.longitude, pos.coords.latitude]);
        map.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 });
      },
      () => console.log(`can't get coords`),
    );
    setLoading(false);
  };

  useEffect(() => {
    console.log('loading', loading);
  }, [loading]);

  return (
    <div className={'overflow-hidden rounded-2xl h-full w-full relative'}>
      <Suspense fallback={<Spinner />}>
        <div className={'w-full h-full'} ref={mapContainer} />
      </Suspense>
      <Button className={'absolute top-5 right-5 opacity-50'} onClick={flyTo}>
        {loading ? <Spinner /> : <h1>Get Current Location</h1>}
      </Button>
    </div>
  );
};

export default Map;