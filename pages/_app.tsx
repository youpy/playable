import { Provider, Session } from 'next-auth/client';
import React from 'react';

interface PageProps {
  session: Session;
}

interface Props {
  Component: React.ComponentType<PageProps>;
  pageProps: PageProps;
}

const App = ({ Component, pageProps }: Props) => {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default App;
