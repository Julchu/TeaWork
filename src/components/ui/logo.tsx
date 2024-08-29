import { FC } from 'react';
import Link from 'next/link';
import { Button } from 'src/components/ui/button';
import { montserrat } from 'src/components/ui/fonts';

const Logo: FC = () => {
  return (
    <Link href={'/'}>
      <Button
        className={`rounded-md h-9 px-4 py-2 opacity-50 bg-blue-600 text-2xl font-bold absolute top-5 left-5 cursor-pointer text-white tracking-widest ${montserrat.className}`} // Full screen margin change: m-6
      >
        TeaWork
      </Button>
    </Link>
  );
};

export default Logo;