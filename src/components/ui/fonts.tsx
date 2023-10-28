import { Amatic_SC, Montserrat, Urbanist } from 'next/font/google';

export const montserrat = Montserrat({ subsets: ['latin'] });

export const urbanist = Urbanist({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

export const amaticSC = Amatic_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
});

// export const inter = Inter({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800', '900'],
// });