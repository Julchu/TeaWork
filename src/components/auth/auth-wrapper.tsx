'use client';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase/firebase-config';
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import PersonIcon from 'src/components/ui/icons/person';
import Link from 'next/link';
import { Button } from 'src/components/ui/button';

const AuthWrapper: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <>
      {children}

      {/* Modal: false, in case PC users still want to scroll map while modal is open */}
      <DropdownMenu modal={false}>
        <MenuTriggerButton />

        <MenuContent />
      </DropdownMenu>
    </>
  );
};

const MenuContent: FC = () => {
  const { authUser } = useAuthContext();

  const [login, _user, _loading, _error] = useSignInWithGoogle(authentication);
  const [logout] = useSignOut(authentication);

  const authHandler = useCallback(async () => {
    if (authUser) await logout();
    else await login();
  }, [login, logout, authUser]);

  return (
    <DropdownMenuContent align={'end'} className={'border-0'}>
      {authUser?.displayName ? (
        <>
          <DropdownMenuLabel className={'text-center'}>{authUser?.displayName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </>
      ) : null}

      {authUser ? (
        <>
          <DropdownMenuItem asChild>
            <Link href={'/other-examples'}>Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={authHandler}>Logout</DropdownMenuItem>
        </>
      ) : (
        <DropdownMenuItem onSelect={authHandler}>Login</DropdownMenuItem>
      )}
      <DropdownMenuArrow fill={'white'} />
    </DropdownMenuContent>
  );
};
const MenuTriggerButton: FC = () => {
  const { authUser } = useAuthContext();

  /* Using user displayName (and initials) instead of userInfo first/lastName
   ** Currently userInfo name won't get updated because not using snapshot
   ** If using user snapshot and updating userInfo in real time, then can use updated userInfo
   */
  const initials = useMemo(() => {
    const names = authUser?.displayName?.split(' ');
    if (names) return `${names[0][0].toUpperCase()} ${names[names.length - 1][0].toUpperCase()}`;
    else return '';
  }, [authUser?.displayName]);

  return (
    <DropdownMenuTrigger asChild>
      <div className={'absolute top-5 right-5 w-[40px] h-[40px] m-6 cursor-pointer'}>
        {authUser ? (
          <>
            <Button className={'font-extrabold absolute opacity-50 w-full h-full p-0 rounded-full'}>
              {initials}
            </Button>
          </>
        ) : (
          <div className={'h-full w-full p-1 bg-gray-200 rounded-full'}>
            <PersonIcon />
          </div>
        )}
      </div>
    </DropdownMenuTrigger>
  );
};

export default AuthWrapper;