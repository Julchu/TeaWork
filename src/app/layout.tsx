import './globals.css';
import type { Metadata } from 'next';
import React, { FC, ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { montserrat } from 'src/components/ui/fonts';
import { cookies } from 'next/headers';
import Providers from 'src/hooks/use-providers';
import Logo from 'src/components/ui/logo';
import { fetchGeoInfo, fetchUserInfo } from 'src/lib/actions';

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const RootLayout: FC<{ children: ReactNode }> = async ({ children }) => {
  const authIdToken = cookies().get('__session')?.value;
  const userInfo = await fetchUserInfo(authIdToken);

  const ip = process.env.NEXT_PUBLIC_LOCAL_IP;
  const geo = await fetchGeoInfo(authIdToken, ip);
  console.log('layout geo:', geo);
  // const geo = cookies().get('geo')?.value;
  // console.log('geo', geo);

  // TODO: dark mode cookie from middleware API fetch
  return (
    <html lang="en">
      <body className={`${montserrat.className} 'dark:bg-black'`}>
        <Providers currentUser={userInfo?.currentUser}>{children}</Providers>
        <Logo />

        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;