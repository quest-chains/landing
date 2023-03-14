import { Flex, Stack, useBreakpointValue } from '@chakra-ui/react';

import { MenuLandingDesktop } from '@/components/Landing/MenuLandingDesktop';
import { MenuLandingMobile } from '@/components/Landing/MenuLandingMobile';
import { Footer } from '@/components/Layout/Footer';
import { Header } from '@/components/Layout/Header';

export const AppLayout: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const isSmallScreen = useBreakpointValue({ base: true, lg: false });

  return (
    <Stack
      align="center"
      fontFamily="body"
      minH="100vh"
      w="100%"
      justify="space-between"
    >
      <Header>
        {isSmallScreen ? <MenuLandingMobile /> : <MenuLandingDesktop />}
      </Header>
      <Flex
        direction="column"
        w="100%"
        transition="opacity 0.25s"
        overflowX="hidden"
      >
        {children}
      </Flex>
      <Footer />
    </Stack>
  );
};
