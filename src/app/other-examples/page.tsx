import { FC } from 'react';
import Test from 'src/components/test/test';
import Map from 'src/components/test/map';
import AuthWrapper from 'src/components/auth/auth-wrapper';

const OtherExample: FC = () => {
  return (
    <>
      <AuthWrapper>
        <Test />
      </AuthWrapper>

      <Map />
    </>
  );
};

export default OtherExample;