'use client';
import * as React from 'react';
import { FC, ReactNode, useMemo } from 'react';
import PersonIcon from 'src/components/ui/icons/person';
import { montserrat } from 'src/components/ui/fonts';
import { MenuContent } from 'src/components/auth/auth-menu';
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Button } from 'src/components/ui/button';
import { UserInfo } from 'src/lib/firebase/interfaces';

const AuthWrapper: FC<{
  children: ReactNode;
  currentUser?: UserInfo;
}> = ({ children, currentUser }) => {
  return (
    <>
      {children}

      {/* Modal: false, in case PC users still want to scroll map while modal is open */}
      <DropdownMenu modal={false}>
        <MenuTriggerButton currentUser={currentUser} />

        <DropdownMenuContent
          sideOffset={4}
          align={'end'}
          className={
            'border-0 z-50 min-w-[8rem] rounded-md bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          }
        >
          <MenuContent />
          <DropdownMenuArrow className={'fill-white'} />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const MenuTriggerButton: FC<{ currentUser?: UserInfo }> = ({ currentUser }) => {
  /* Using user displayName (and initials) instead of userInfo first/lastName
   ** Currently userInfo name won't get updated because not using snapshot
   ** If using user snapshot and updating userInfo in real time, then can use updated userInfo
   */
  const initials = useMemo(() => {
    const firstName = currentUser?.firstName;
    const lastName = currentUser?.lastName;
    if (firstName && lastName) return `${firstName[0].toUpperCase()} ${lastName[0].toUpperCase()}`;
    else return '';
  }, [currentUser?.firstName, currentUser?.lastName]);

  return (
    <DropdownMenuTrigger asChild>
      <div className={'absolute top-5 right-5 w-[40px] h-[40px] cursor-pointer'}>
        {/* Full screen margin change: m-6 */}
        {currentUser ? (
          <>
            <Button
              className={`font-bold absolute opacity-60 bg-blue-600 w-full h-full p-0 rounded-full ${montserrat.className}`}
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