import React from 'react';

import { Layout } from './components/layout';
import FilePicker from './components/FilePicker/file-picker';

export const App = () => {
  return (
    <Layout>
      <div className="">
        <div className="">
          <FilePicker></FilePicker>
        </div>
      </div>
    </Layout>
  );
};
