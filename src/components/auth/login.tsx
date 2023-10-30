'use client';
import { FC } from 'react';
import { Button } from 'src/components/ui/button';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase/firebase-config';

const Login: FC = () => {
  const [login] = useSignInWithGoogle(authentication);

  return (
    <Button
      onClick={async () => {
        await login();
      }}
    >
      Sign In
    </Button>
  );
};

export default Login;
