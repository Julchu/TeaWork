import './globals.css';
import type { Metadata } from 'next';
import React, { FC, ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { montserrat } from 'src/components/ui/fonts';
import { cookies, headers } from 'next/headers';
import Providers from 'src/hooks/use-providers';
import process from 'process';
import { getFirebaseServerApp } from 'src/lib/firebase/server-app';
import Logo from 'src/components/ui/logo';
import { User } from 'firebase/auth';

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

export const dynamic = 'force-dynamic';

const RootLayout: FC<{ children: ReactNode }> = async ({ children }) => {
  const { currentUser } = await getFirebaseServerApp();
  console.log('currentUser', JSON.stringify(currentUser?.toJSON()));

  const locInfo = cookies().get('geo');
  const headerStore = headers();

  const ip = (headerStore.get('x-forwarded-for') || '').split(',')[0];

  const url = `https://ipinfo.io/${ip.length >= 5 ? ip : ''}?token=${
    process.env.NEXT_PUBLIC_IPINFO_GEOLOCATION_API_KEY
  }`;

  const timeZone =
    headerStore.get('x-vercel-ip-timezone') ||
    // Try fetching geolocation using IpInfo.io services; if not; return Toronto geolocation
    (await fetch(url).then(async response => {
      const locationObj = await response.json();
      if (locationObj['timezone']) {
        return locationObj['timezone'];
      } else {
        return 'America/Toronto';
      }
    }));

  const currentHour = parseInt(
    new Intl.DateTimeFormat([], {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h24',
    }).format(),
  );

  const shouldUseDarkMode = 18 < currentHour || currentHour <= 6;

  return (
    <html lang="en">
      <body className={`${montserrat.className} ${shouldUseDarkMode ? 'bg-black' : ''}`}>
        <Providers currentUser={currentUser?.toJSON() as User}>{children}</Providers>
        <Logo locInfo={JSON.stringify(locInfo)} />

        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;