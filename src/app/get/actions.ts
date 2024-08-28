'use server';

import { cookies } from 'next/headers';

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