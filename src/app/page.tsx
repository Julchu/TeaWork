import { FC } from 'react';
import Map from 'src/components/map/map';

const Home: FC = async () => {
  const currentTime = new Date();
  const shouldUseDarkMode = currentTime.getHours() >= 18;

  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main
      className={`flex h-screen-small w-screen items-center justify-between p-6
        ${shouldUseDarkMode ? 'bg-gray-900' : ''}
      `}
    >
      <Map shouldUseDarkMode={shouldUseDarkMode} />
    </main>
  );
};

export default Home;