import { FC, Suspense } from 'react';
import TestSettings from 'src/app/settings/test';
import TestSettingsLoading from 'src/app/settings/loading';

const Settings: FC<{ searchParams: URLSearchParams }> = ({ searchParams }) => {
  console.log(searchParams);
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen-small w-screen items-center justify-between p-6">
      <Suspense fallback={<TestSettingsLoading />}>
        <TestSettings />
      </Suspense>
    </main>
  );
};
export default Settings;