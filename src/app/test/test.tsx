'use client';

import * as React from 'react';
import { FC } from 'react';
import { Button } from 'src/components/ui/button';
import { montserrat } from 'src/components/ui/fonts';
import { create } from 'src/lib/actions';

export const Test: FC = () => {
  const onClickHandler = async () => {
    console.log('test');
    await create({ firstName: 'julian', lastName: 'chu' });
  };

  return (
    <>
      <Button
        onClick={onClickHandler}
        className={`font-bold absolute opacity-60 bg-blue-600 w-full h-full p-0 rounded-full ${montserrat.className}`}
      >
        Test
      </Button>
    </>
  );
};