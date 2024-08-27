import { NextRequest, NextResponse } from 'next/server';

const getIpInfo = async (ip: string) => {
  const url = `https://ipinfo.io/${ip.length > 5 ? ip : ''}?token=${
    process.env.NEXT_PUBLIC_IPINFO_GEOLOCATION_API_KEY
  }`;

  try {
    const res = await fetch(new URL(url).href);
    return await res.json();
  } catch (err) {
    console.error('Invalid URL or IP address');
  }
};

export const getMiddleware = async (request: NextRequest, response: NextResponse) => {
  const ip = request.headers.get('X-Forwarded-For');
  if (ip) {
    const { loc } = await getIpInfo(ip);
    response.cookies.set(
      'geo',
      JSON.stringify({
        lat: loc[0],
        lng: loc[1],
      }),
    );
  }
};