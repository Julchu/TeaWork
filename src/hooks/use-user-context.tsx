'use client';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserInfo } from 'src/lib/firebase/interfaces/generics';
import { useAuthContext } from 'src/hooks/use-auth-context';
import useUserHook from 'src/hooks/use-user-firestore-hook';
import process from 'process';

export const UserContext = createContext<UserProps>({
  userInfo: {},
  setUserInfo: () => void 0,
});

type UserProps = {
  userInfo: Partial<UserInfo | undefined>;
  setUserInfo: Dispatch<SetStateAction<Partial<UserInfo | undefined>>>;
};

export const useUserContext = (): UserProps => useContext(UserContext);

const UserProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { authUser } = useAuthContext();
  const [{ getUser }] = useUserHook();
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();

  // Sets user object on auth changes (login/logout, page refresh)
  useEffect(() => {
    if (authUser) {
      getUser().then(userSnapshot => {
        setUserInfo({
          ...userSnapshot?.data(),
        });
      });
    } else {
      fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}`,
        { method: 'POST' },
      ).then(async response => {
        const locationObj = await response.json();
        const {
          location: { lng, lat },
        } = locationObj;
        setUserInfo({ lastLocation: { lng, lat } });
      });
    }
  }, [getUser, authUser]);

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

// Live data updates to user state
// useEffect(() => {
//   const q = query(db.userCollection, where('firstName', '==', 'Julian'));
//   if (user)
//     onSnapshot(db.userDoc(user?.uid), doc => {
//       setLiveData(doc.data());
//     });
// }, [user]);