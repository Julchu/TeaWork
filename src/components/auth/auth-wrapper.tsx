'use client';
import { FC, ReactNode, useCallback, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from 'src/components/ui/avatar';
import PersonIcon from 'src/components/ui/icons/person';
import Link from 'next/link';

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const initials = useMemo(() => {
    const names = user?.displayName?.split(' ');
    if (names) return `${names[0][0].toUpperCase()}${names}`;
    else return '';
  }, [user?.displayName]);
  const [login, _, loading, error] = useSignInWithGoogle(authentication);
  const [logout] = useSignOut(authentication);

  const authHandler = useCallback(async () => {
    if (user) await logout();
    else await login();
  }, [login, logout, user]);

  return (
    <>
      {children}

      {/* Modal: false, in case PC users still want to scroll map while modal is open */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Avatar className={'absolute top-5 right-5 w-[40px] h-[40px] m-6 cursor-pointer'}>
            {user ? (
              <>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{user.displayName}</AvatarFallback>
              </>
            ) : (
              <div className={'h-full w-full p-1 bg-gray-200'}>
                <PersonIcon />
              </div>
            )}
          </Avatar>
        </DropdownMenuTrigger>

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
      </DropdownMenu>
    </>
  );
};

export default AuthWrapper;