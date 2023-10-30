import { FC } from 'react';
import Link from 'next/link';
import { Button } from 'src/components/ui/button';
import { urbanist } from 'src/components/ui/fonts';

const Logo: FC = () => {
  return (
    <Link href={'/'}>
      <Button
        className={`opacity-50 bg-blue-600 text-2xl font-bold absolute top-5 left-5 m-6 cursor-pointer text-white tracking-widest ${urbanist.className}`}
      >
        TeaWork
      </Button>
    </Link>
  );
};

export default Logo;
