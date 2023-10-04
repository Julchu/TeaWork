'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapBoxGL from 'mapbox-gl';
import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import * as process from 'process';

const MapTest: FC = () => {
  const mapContainer = useRef<any>(null);
  const map = useRef<mapBoxGL.Map | null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  //
  useEffect(() => {
    if (map.current) return;
    mapBoxGL.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    map.current = new mapBoxGL.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    });
  });

  return (
    <div className={'overflow-hidden rounded-lg h-full w-full'}>
      <div className={'w-full h-screen'} ref={mapContainer} />
    </div>
  );
};

export default MapTest;