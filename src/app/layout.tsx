import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import Providers from 'src/hooks/use-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
