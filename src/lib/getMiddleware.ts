import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoInfo } from 'src/lib/actions';
import { cookies } from 'next/headers';

const getIpInfo = async (ip: string) => {
  if (ip.includes('localhost') || ip.includes('127.0.0.1')) return;
  try {
    // GCP (with load balancer) offers 2 IPs; 1st is actual, 2nd is load balancer's IP address
    const url = `https://ipinfo.io/${ip.length > 5 ? ip : ''}?token=${
      process.env.NEXT_PUBLIC_IPINFO_GEOLOCATION_API_KEY
    }`;
    const res = await fetch(new URL(url).href);
    const { loc } = await res.json();
    return {
      lat: loc[0],
      lng: loc[1],
    };
  } catch (err) {
    console.error('Invalid URL or IP address');
  }
};

export const getMiddleware = async (request: NextRequest, response: NextResponse) => {
  try {
    const ip = process.env.NEXT_PUBLIC_LOCAL_IP
      ? process.env.NEXT_PUBLIC_LOCAL_IP
      : request.headers.get('X-Forwarded-For')?.split(',')[0];
    const authIdToken = cookies().get('__session')?.value;
    const geo = await fetchGeoInfo(authIdToken, ip);

    // const geo = request.geo;

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // TODO: if geo cookie exists, make BE API call to grab rate-limited geolocation, pass ip as POST body
    if (geo)
      response.cookies.set('geo', JSON.stringify(geo), {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
  } catch (error) {
    console.error('Geolocation error', error);
  }
};