'use server';

import { cookies } from 'next/headers';
import { Coordinates, UserInfo } from 'src/lib/firebase/interfaces';

export async function create({ firstName, lastName }: { firstName: string; lastName: string }) {
  cookies().set('name', `${firstName} ${lastName}`);
}

export const setCookies = async (cookiesToAdd: { key: string; value: string }[]) => {
  cookiesToAdd.forEach(({ key, value }) => {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    cookies().set(key, value, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  });
};

export const deleteCookies = async (cookiesToRemove: string[]) => {
  cookiesToRemove.forEach(key => {
    cookies().delete(key);
  });
};

type FetchUserInfoType = {
  currentUser?: UserInfo;
};
export const fetchUserInfo = async (
  authIdToken?: string,
): Promise<FetchUserInfoType | undefined> => {
  if (!authIdToken) return;

  try {
    const userInfo = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/userInfo/currentUser`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authIdToken}`,
        },
      },
    ).then(async data => {
      return await data.json();
    });

    if (userInfo) {
      return userInfo;
    }
  } catch (error) {
    console.log('Error fetching user info', error);
  }
  return;
};

type FetchGeoType = {
  geo?: Coordinates;
};

export const fetchGeoInfo = async (
  authIdToken?: string,
  ip?: string,
): Promise<FetchGeoType | undefined> => {
  if (!authIdToken || !ip) return;

  const body = JSON.stringify({ ip });

  try {
    const geoInfo = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/userInfo/geo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authIdToken}`,

        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip }),
    }).then(async data => {
      return await data.json();
    });

    if (geoInfo) {
      return geoInfo;
    }
  } catch (error) {
    console.log('Error fetching geo info', error);
  }
  return;
};