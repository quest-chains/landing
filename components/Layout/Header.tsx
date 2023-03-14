import { Flex, HStack, Image, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';

export const Header: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return (
    <HStack
      w="100%"
      h={20}
      zIndex={1000}
      backdropFilter="blur(8px)"
      pos="fixed"
      background="linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%)"
      justifyContent="center"
    >
      <Flex
        justify="space-between"
        w="100%"
        maxW={{ base: '100rem', '4xl': '125rem' }}
        px={{ base: 4, md: 4, lg: 12, xl: 32 }}
      >
        <ChakraLink
          display="block"
          _hover={{}}
          w={16}
          as={NextLink}
          href="/explore"
        >
          <Image src="/logo.png" alt="Quest Chains" height={9} />
        </ChakraLink>

        {children}
      </Flex>
    </HStack>
  );
};
