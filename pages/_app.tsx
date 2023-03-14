import '@/assets/styles/fonts.css';

import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { AppProps } from 'next/app';
import React, { useEffect } from 'react';

import { AppLayout } from '@/components/Layout/AppLayout';
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
