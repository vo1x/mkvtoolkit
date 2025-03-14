import React from 'react';

import { Layout } from './components/layout';
import FilePicker from './components/FilePicker/file-picker';

export const App = () => {
  return (
    <Layout>
      <FilePicker />
    </Layout>
  );
};
