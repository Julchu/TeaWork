import './globals.css';
import type { Metadata } from 'next';
import { Amatic_SC, Inter, Montserrat, Poppins, Urbanist } from 'next/font/google';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import AuthProvider from 'src/hooks/use-auth-context';

const montserrat = Montserrat({ subsets: ['latin'] });
const urbanist = Urbanist({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});
const amaticSC = Amatic_SC({ subsets: ['latin'], weight: '400' });
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'TeaWork',
  description: 'Find nice environments to grab tea and work at',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${urbanist.className}`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}