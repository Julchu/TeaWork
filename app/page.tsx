import { Button } from 'app/components/ui/button';
import { FC } from 'react';

const Home: FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Click me</Button>
    </main>
  );
};

export default Home;