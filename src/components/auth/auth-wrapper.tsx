'use client';
import { FC, ReactNode, useCallback } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import { useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase';
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
import { useUserContext } from 'src/hooks/use-user-context';

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
  const { user } = useAuthContext();

  const [login, _user, _loading, _error] = useSignInWithGoogle(authentication);
  const [logout] = useSignOut(authentication);

  const authHandler = useCallback(async () => {
    if (user) await logout();
    else await login();
  }, [login, logout, user]);

  return (
    <DropdownMenuContent align={'end'} className={'border-0'}>
      {user?.displayName ? (
        <>
          <DropdownMenuLabel className={'text-center'}>{user?.displayName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </>
      ) : null}

      {user ? (
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
  const { user } = useAuthContext();
  const { userInfo } = useUserContext();

  return (
    <DropdownMenuTrigger asChild>
      <div className={'absolute top-5 right-5 w-[40px] h-[40px] m-6 cursor-pointer'}>
        {user && userInfo?.firstName ? (
          <>
            <Button className={'font-extrabold absolute opacity-50 w-full h-full p-0 rounded-full'}>
              {`${userInfo?.firstName?.[0].toUpperCase()} ${userInfo?.lastName?.[0].toUpperCase()}`}
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