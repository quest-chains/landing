import '@/assets/styles/fonts.css';

import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { AppProps } from 'next/app';
import Script from 'next/script';
import React, { useEffect } from 'react';

import { AppLayout } from '@/components/Layout/AppLayout';
import { PLAUSIBLE_DATA_DOMAIN } from '@/utils/constants';
import { globalStyles, theme } from '@/utils/theme';

const ForceDarkMode: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (colorMode === 'dark') return;
    toggleColorMode();
  }, [colorMode, toggleColorMode]);

  return children;
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <ForceDarkMode>
        <React.Fragment>
          <Script
            type="text/javascript"
            defer
            data-domain={PLAUSIBLE_DATA_DOMAIN}
            data-api="/jjmahtdkrp/api/event"
            src="/jjmahtdkrp/js/script.js"
          />
          <Global styles={globalStyles} />
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </React.Fragment>
      </ForceDarkMode>
    </ChakraProvider>
  );
};

export default App;
