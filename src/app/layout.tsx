import './globals.css';
import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import AuthProvider from 'src/hooks/use-auth-context';
import AuthWrapper from 'src/components/auth/auth-wrapper';
import Logo from 'src/components/ui/logo';
import UserProvider from 'src/hooks/use-user-context';
import { urbanist } from 'src/components/ui/fonts';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

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
        <AuthProvider>
          <UserProvider>
            <AuthWrapper>{children}</AuthWrapper>
            <Logo />
          </UserProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
