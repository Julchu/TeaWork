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
import { UserInfo } from 'src/lib/firebase/interfaces';
import { useAuthContext } from 'src/hooks/use-auth-context';
import useUserHook from 'src/hooks/use-user-firestore-hook';

export const UserContext = createContext<UserProps>({
  userInfo: {},
  setUserInfo: () => void 0,
  userLoading: false,
});

type UserProps = {
  userInfo: Partial<UserInfo | undefined>;
  setUserInfo: Dispatch<SetStateAction<Partial<UserInfo | undefined>>>;
  userLoading: boolean;
};

export const useUserContext = (): UserProps => useContext(UserContext);

const UserProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { authUser, authLoading, authError } = useAuthContext();
  const [{ getUser }, userLoading] = useUserHook();
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();

  // Sets user object on auth changes (login/logout, page refresh)
  useEffect(() => {
    if (!authLoading && authUser) {
      // Need to set userInfo here as the context; can't set userInfo in hook directly as well as no circular dependencies
      getUser().then(userSnapshot => {
        setUserInfo(userSnapshot?.data());
      });
    } else setUserInfo({});
  }, [authLoading, authUser, getUser]);

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo,
        userLoading,
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