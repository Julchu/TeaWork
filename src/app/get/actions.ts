'use server';

import { cookies } from 'next/headers';

export async function create({ firstName, lastName }: { firstName: string; lastName: string }) {
  cookies().set('name', `${firstName} ${lastName}`);
}

export const setCookies = async (cookiesToAdd: { key: string; value: string }[]) => {
  cookiesToAdd.forEach(({ key, value }) => {
    cookies().set(key, value);
  });
};

export const deleteCookies = async (cookiesToRemove: string[]) => {
  cookiesToRemove.forEach(key => {
    cookies().delete(key);
  });
};