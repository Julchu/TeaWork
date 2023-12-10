'use client';
import { FC, ReactNode, useMemo } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import PersonIcon from 'src/components/ui/icons/person';
import { Button } from 'src/components/ui/button';
import { urbanist } from 'src/components/ui/fonts';
import { MenuContent } from 'src/components/auth/auth-menu';

const AuthWrapper: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <>
      {children}

      {/* Modal: false, in case PC users still want to scroll map while modal is open */}
      <DropdownMenu modal={false}>
        <MenuTriggerButton />

        <DropdownMenuContent align={'end'} className={'border-0'}>
          <MenuContent />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
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
            <Button
              className={`font-bold absolute opacity-60 bg-blue-600 w-full h-full p-0 rounded-full ${urbanist.className}`}
            >
              {initials}
            </Button>
          </>
        ) : (
          <div
            className={
              'h-full w-full p-1 opacity-60 bg-blue-600 rounded-full flex justify-center items-center'
            }
          >
            <PersonIcon />
          </div>
        )}
      </div>
    </DropdownMenuTrigger>
  );
};

export default AuthWrapper;