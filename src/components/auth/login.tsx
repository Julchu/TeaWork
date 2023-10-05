'use client';
import { FC } from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase';
import { Button } from 'src/components/ui/button';

const Login: FC = () => {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(authentication);

  return (
    <Button
      onClick={() => {
        signInWithGoogle();
      }}
    >
      Sign In
    </Button>
  );
};

export default Login;