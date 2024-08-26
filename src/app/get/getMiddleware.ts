import { initializeApp, initializeServerApp } from 'firebase/app';
import { Auth, getAuth, getIdToken } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { getInstallations, getToken } from 'firebase/installations';
import { NextRequest, NextResponse } from 'next/server';
import { firebaseConfig } from 'src/lib/firebase/firebase-config';
import { getAuthenticatedAppForUser } from 'src/lib/firebase/server-app';

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

  const authIdToken = request.cookies.get('token');

  // const { installations } = await getAuthenticatedAppForUser();

  // console.log('authidtoken:', authIdToken);

  // if (authIdToken) request.headers.set('Authorization', `Bearer ${authIdToken}`);

  // const headers = new Headers(request.headers);
  // // const installationToken = await getToken(installations);
  // // headers.append('Firebase-Instance-ID-Token', installationToken);
  // if (authIdToken) headers.append('Authorization', `Bearer ${authIdToken}`);
  // const newRequest = new Request(request, { headers: request.headers });
  // return await fetch(newRequest);
};
