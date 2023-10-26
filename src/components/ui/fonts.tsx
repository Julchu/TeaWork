import { Amatic_SC, Inter, Montserrat, Urbanist } from 'next/font/google';

export const montserrat = Montserrat({ subsets: ['latin'] }).className;

export const urbanist = Urbanist({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
}).className;

export const amaticSC = Amatic_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
}).className;

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
}).className;