'use client';
import { FC } from 'react';
import { Button } from 'src/components/ui/button';
import { useSignOut } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase/firebase-config';

const SignOut: FC = () => {
  const [logout] = useSignOut(authentication);

  return (
    <Button
      onClick={async () => {
        await logout();
      }}
    >
      Sign out
    </Button>
  );
};

export default SignOut;
