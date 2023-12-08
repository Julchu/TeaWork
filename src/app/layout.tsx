import './globals.css';
import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { urbanist } from 'src/components/ui/fonts';
import { headers } from 'next/headers';
import Providers from 'src/hooks/use-providers';

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

export const runtime = 'edge';

export default function RootLayout({ children }: { children: ReactNode }) {
  const headerStore = headers();
  const timeZone = headerStore.get('x-vercel-ip-timezone');
  const time = parseInt(
    new Intl.DateTimeFormat([], {
      timeZone: timeZone || 'America/Toronto',
      hour: 'numeric',
      hourCycle: 'h24',
    }).format(),
  );

  const shouldUseDarkMode = 18 < time || time <= 6;

  return (
    <html lang="en">
      <body className={`${urbanist} ${shouldUseDarkMode ? 'bg-black' : ''}`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}