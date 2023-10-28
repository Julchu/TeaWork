import { FC, Suspense } from 'react';
import TestSettings from 'src/app/settings/test';
import TestSettingsLoading from 'src/app/settings/loading';
import { cookies, headers } from 'next/headers';

const Settings: FC<{ searchParams: URLSearchParams }> = ({ searchParams }) => {
  console.log(searchParams);
  const cookieStore = cookies();
  const headerStore = headers();
  console.log('inside settingspage', JSON.stringify(cookieStore));
  console.log('inside settingspage', JSON.stringify(headerStore));
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen-small w-screen items-center justify-between p-6">
      <Suspense fallback={<TestSettingsLoading />}>
        <TestSettings cookieStore={cookieStore} headerStore={headerStore} />
      </Suspense>
    </main>
  );
};
export default Settings;