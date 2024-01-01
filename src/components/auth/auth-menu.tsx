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
import { useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';
import { authentication } from 'src/lib/firebase/firebase-config';

export const MenuContent: FC = () => {
  const { authUser } = useAuthContext();

  const [login, _user, _loading, _error] = useSignInWithGoogle(authentication);
  const [logout] = useSignOut(authentication);

  const authHandler = useCallback(async () => {
    if (authUser) await logout();
    else await login();
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