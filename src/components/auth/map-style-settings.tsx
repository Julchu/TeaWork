'use client';
import { MapStyle } from 'src/lib/firebase/interfaces';
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from 'src/components/ui/dropdown-menu';
import { FC } from 'react';
import { useUserContext } from 'src/hooks/use-user-context';
import useUserHook from 'src/hooks/use-user-firestore-hook';

const MapStyleSelect: FC = () => {
  const { userInfo } = useUserContext();
  const [{ updateUser }] = useUserHook();

  return (
    <DropdownMenuRadioGroup
      value={userInfo?.mapStyle || MapStyle.nav}
      onValueChange={async style =>
        await updateUser({ mapStyle: MapStyle[style as keyof typeof MapStyle] })
      }
    >
      {Object.values(MapStyle).map(style => {
        const styleName = style.slice(0, 1).toUpperCase() + style.slice(1);
        return (
          <DropdownMenuRadioItem key={style} value={style}>
            {styleName}
          </DropdownMenuRadioItem>
        );
      })}
    </DropdownMenuRadioGroup>
  );
};

export default MapStyleSelect;