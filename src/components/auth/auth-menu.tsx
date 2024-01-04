import * as React from 'react';
import { FC, useCallback } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
// import {
// } from 'src/components/ui/dropdown-menu';
import MapStyleSelect from 'src/components/auth/map-style-settings';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@radix-ui/react-dropdown-menu';
import { ChevronRightIcon } from '@radix-ui/react-icons';

export const MenuContent: FC = () => {
  const { authUser, userInfo, logout, login } = useAuthContext();

  const authHandler = useCallback(async () => {
    if (authUser) logout();
    else login();
  }, [login, logout, authUser]);
  return (
    <>
      {authUser?.displayName ? (
        <>
          <DropdownMenuLabel className={'px-2 py-1.5 text-sm font-semibold text-center'}>
            {authUser?.displayName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className={'-mx-1 my-1 h-px bg-muted'} />
        </>
      ) : null}

      {authUser ? (
        <>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={`flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent`}
            >
              Map style
              <ChevronRightIcon className="ml-auto h-4 w-4" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`}
            >
              <MapStyleSelect />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`}
            onSelect={authHandler}
          >
            Logout
          </DropdownMenuItem>
        </>
      ) : (
        <DropdownMenuItem
          className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`}
          onSelect={authHandler}
        >
          Login
        </DropdownMenuItem>
      )}
    </>
  );
};