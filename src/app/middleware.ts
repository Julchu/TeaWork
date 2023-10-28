import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export const middleware = async (request: NextRequest) => {
  // const { nextUrl: url, geo } = request;
  //
  // const city = geo?.city ?? app.location.city;
  // const country = geo?.country ?? app.location.country;
  //
  // url.searchParams.set('city', city);
  // url.searchParams.set('country', country);
  //
  // return NextResponse.rewrite(url);
  const res = NextResponse.next();

  let geoIp = await fetch('https://geolocation-db.com/json/').then(response => response.json());

  // if (geoIp) {
  //   res.headers.set('x-forwarded-for', geoIp.IPv4);
  //
  //   res.headers.set('x-real-ip', geoIp.IPv4);
  //
  //   let geo = geoIp;
  //
  //   delete geo.IPv4;
  //
  //   res.headers.set('geo', JSON.stringify(geo));
  // }
  res.headers.set('cheese', JSON.stringify(geoIp));
  res.headers.set('x-real-ip', JSON.stringify(geoIp));
  return res;
};

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
};