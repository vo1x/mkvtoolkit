import React, { useEffect } from 'react';
import AppBar from '../AppBar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.Main.removeLoading();

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <>
      <AppBar />
      <div className="h-[calc(100vh-32px)] overflow-hidden">
        <div className="h-full overflow-auto">{children}</div>
      </div>
    </>
  );
};
