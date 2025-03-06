import React, { useEffect } from 'react';
import AppBar from '../AppBar';

export const Layout = ({ children }: { children: React.ReactNode }) => {

  useEffect(() => {
    window.Main.removeLoading();
  }, []);

  return (
    <>
      <AppBar></AppBar>
      <div className='p-4'>{children}</div>
    </>
  );
};
