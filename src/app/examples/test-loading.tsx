// This loading component (in /examples/) will act as Suspense wrapper for localhost:3000/example
// The component is exported and can be used to manually wrap other components
// This loading component will appear (and temporarily replace all children) before children Suspense loads

import { Alert, AlertDescription, AlertTitle } from 'src/components/ui/alert';

const TestLoading = () => {
  // return <Skeleton className="w-[100px] h-[20px] rounded-full" />;
  return (
    <Alert className={'bg-blue-950'}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
  );
};

export default TestLoading;
//