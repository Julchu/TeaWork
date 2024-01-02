import { FC, useCallback } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from 'src/components/ui/dropdown-menu';
import MapStyleSelect from 'src/components/auth/map-style-settings';

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
          <DropdownMenuLabel className={'text-center'}>{authUser?.displayName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </>
      ) : null}

      {authUser ? (
        <>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Map style</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <MapStyleSelect />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={authHandler}>Logout</DropdownMenuItem>
        </>
      ) : (
        <DropdownMenuItem onSelect={authHandler}>Login</DropdownMenuItem>
      )}
    </>
  );
};