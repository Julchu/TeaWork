'use server';

import { cookies } from 'next/headers';
import { User } from 'firebase/auth';

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

export const fetchUserInfo = async (authIdToken?: string): Promise<string> => {
  if (!authIdToken) return 'test email';

  try {
    const currentUser = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authIdToken}`,
      },
    }).then(async data => {
      return (await data.json()) as User;
    });

    if (currentUser && currentUser.email) {
      console.log('currentUser', JSON.stringify(currentUser));
      return currentUser.email;
    }
    return 'cheese';
  } catch (error) {
    console.log('fetch error', error);
  }
  return 'test email';
};