'use client';
import { MapStyle } from 'src/lib/firebase/interfaces';
import * as React from 'react';
import { FC } from 'react';
import { useAuthContext } from 'src/hooks/use-auth-context';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@radix-ui/react-dropdown-menu';
import { DotFilledIcon } from '@radix-ui/react-icons';

const MapStyleSelect: FC = () => {
  const { userInfo } = useAuthContext();
  const [{ updateUser }] = useUserHook();

  return (
    <DropdownMenuRadioGroup
      value={userInfo?.mapStyle || MapStyle.standard}
      onValueChange={async style =>
        await updateUser({ mapStyle: MapStyle[style as keyof typeof MapStyle] })
      }
    >
      {Object.values(MapStyle).map(style => {
        const styleName = style.slice(0, 1).toUpperCase() + style.slice(1);
        return (
          <DropdownMenuRadioItem
            key={style}
            value={style}
            className={
              'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
            }
          >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <DropdownMenuItemIndicator>
                <DotFilledIcon className="h-4 w-4 fill-current" />
              </DropdownMenuItemIndicator>
            </span>
            {styleName}
          </DropdownMenuRadioItem>
        );
      })}
    </DropdownMenuRadioGroup>
  );
};

export default MapStyleSelect;