import { FC } from 'react';
import { cookies, headers } from "next/headers";

const Settings: FC = () => {
  const cookieStore = cookies();
  const headerStore = headers();
  console.log(cookieStore);
  console.log(headerStore);
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen-small w-screen items-center justify-between p-6">Settings</main>
  );
};
export default Settings;