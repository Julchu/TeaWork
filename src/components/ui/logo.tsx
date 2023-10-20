import { FC } from 'react';
import Link from 'next/link';

const Logo: FC = () => {
  return (
    <Link href={'/'} prefetch={false}>
      <h1
        className={
          'text-4xl font-extrabold absolute top-5 left-5 m-6 cursor-pointer text-blue-600 z-[1]'
        }
      >
        TeaWork
      </h1>
    </Link>
  );
};

export default Logo;