import { NextRequest, NextResponse } from 'next/server';
import { geolocation } from '@vercel/functions';

const getIpInfo = async (ip: string) => {
  try {
    const url = `https://ipinfo.io/${ip.length > 5 ? ip : ''}?token=${
      process.env.NEXT_PUBLIC_IPINFO_GEOLOCATION_API_KEY
    }`;
    const res = await fetch(new URL(url).href);
    return await res.json();
  } catch (err) {
    console.error('Invalid URL or IP address');
  }
};

export const getMiddleware = async (request: NextRequest, response: NextResponse) => {
  try {
    const details = geolocation(request);
    console.log('geolocation details', details);
  } catch (error) {
    console.log('vercel geolocation error', error);
  }

  // GCP (with load balancer) offers 2 IPs; 1st is actual, 2nd is LB's IP address
  const ip = request.headers.get('X-Forwarded-For')?.split(',')[0];
  console.log('ip:', ip);
  try {
    if (ip) {
      const { loc } = await getIpInfo(ip);
      console.log('loc', loc);
      return response.cookies.set(
        'geo',
        JSON.stringify({
          lat: loc[0],
          lng: loc[1],
        }),
      );
    }
  } catch (error) {
    console.error('Geolocation error', error);
  }
};