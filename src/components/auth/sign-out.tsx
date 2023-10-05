'use client';
import { FC } from 'react';
import { Button } from 'src/components/ui/button';
import { authentication } from 'src/lib/firebase';
import { useSignOut } from 'react-firebase-hooks/auth';

const Signout: FC = () => {
  const [signOut, loading, error] = useSignOut(authentication);

  return (
    <Button
      onClick={() => {
        signOut();
      }}
    >
      Sign out
    </Button>
  );
};

export default Signout;