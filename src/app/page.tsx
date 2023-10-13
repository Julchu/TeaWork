import { FC } from "react";
import Map from "src/components/map/map";

// Simple wrapper to trigger loading state

const Home: FC = () => {
  return (
    // bg-gradient-to-r from-indigo-200 via-purple-500 to-pink-200
    <main className="flex h-screen-small w-screen items-center justify-between p-6">
      <Map />
    </main>
  );
};

export default Home;