import { Flex, Stack, useBreakpointValue, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Header as HeaderComponent } from '@/components/Header';
import { useWallet } from '@/web3';

import { DesktopMenu } from './DesktopMenu';
import { MobileMenu } from './MobileMenu';
import { NavToggle } from './NavToggle';

export const AppLayout: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { isConnected } = useWallet();
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(o => !o);
  const router = useRouter();
  const isSmallScreen = useBreakpointValue({ base: true, md: false });

  return (
    <Stack
      align="center"
      p="0"
      m="0"
      spacing="0"
      fontFamily="body"
      minH="100vh"
    >
      {router.pathname !== '/' && (
        <VStack
          alignItems="center"
          borderBottomRadius="md"
          w="100%"
          mx="auto"
          mb={{ base: 6, md: 8, lg: 12 }}
        >
          <HeaderComponent>
            {isSmallScreen ? (
              <>
                <NavToggle isOpen={isOpen} onClick={toggleOpen} zIndex={1500} />
                <MobileMenu isOpen={isOpen} onClose={toggleOpen} />
              </>
            ) : (
              <DesktopMenu />
            )}
          </HeaderComponent>
        </VStack>
      )}
      <Flex
        direction="column"
        w="100%"
        flex={1}
        overflowX="hidden"
        visibility={
          isOpen && isSmallScreen && isConnected ? 'hidden' : 'visible'
        }
        opacity={isOpen && isSmallScreen && isConnected ? 0 : 1}
        transition="opacity 0.25s"
      >
        {children}
      </Flex>
    </Stack>
  );
};
