import { NextRequest, NextResponse } from 'next/server';

const getIpInfo = async (ip: string) => {
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
    const ip = request.headers.get('X-Forwarded-For')?.split(',')[0];
    const t = request.headers.get('Authorization')?.split('Bearer ')[0];

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    if (ip)
      response.cookies.set('geo', JSON.stringify(await getIpInfo(ip)), {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

    if (t)
      response.cookies.set('t', JSON.stringify(t), {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
  } catch (error) {
    console.error('Geolocation error', error);
  }
};