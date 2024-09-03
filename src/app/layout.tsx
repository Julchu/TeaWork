import './globals.css';
import type { Metadata } from 'next';
import React, { FC, ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { montserrat } from 'src/components/ui/fonts';
import { cookies } from 'next/headers';
import Providers from 'src/hooks/use-providers';
import Logo from 'src/components/ui/logo';
import { fetchUserInfo } from 'src/lib/actions';

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const RootLayout: FC<{ children: ReactNode }> = async ({ children }) => {
  const authIdToken = cookies().get('__session')?.value;

  const currentUser = await fetchUserInfo(authIdToken);

  // const headerStore = headers();
  //
  // const ip = (headerStore.get('x-forwarded-for') || '').split(',')[0];
  //
  // const url = `https://ipinfo.io/${ip.length >= 5 ? ip : ''}?token=${
  //   process.env.NEXT_PUBLIC_IPINFO_GEOLOCATION_API_KEY
  // }`;
  //
  // const timeZone =
  //   headerStore.get('x-vercel-ip-timezone') ||
  //   // Try fetching geolocation using IpInfo.io services; if not; return Toronto geolocation
  //   (await fetch(url).then(async response => {
  //     const locationObj = await response.json();
  //     if (locationObj['timezone']) {
  //       return locationObj['timezone'];
  //     } else {
  //       return 'America/Toronto';
  //     }
  //   }));
  //
  // const currentHour = parseInt(
  //   new Intl.DateTimeFormat([], {
  //     timeZone,
  //     hour: 'numeric',
  //     hourCycle: 'h24',
  //   }).format(),
  // );

  const shouldUseDarkMode = true; //18 < currentHour || currentHour <= 6;

  return (
    <html lang="en">
      <body className={`${montserrat.className} ${shouldUseDarkMode ? 'bg-black' : ''}`}>
        <Providers currentUser={currentUser}>{children}</Providers>
        <Logo />

        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;