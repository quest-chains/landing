import { Button, HStack, Link as ChakraLink, Text } from '@chakra-ui/react';
import { Link } from 'react-scroll';

import { QUESTCHAINS__APP_URL } from '@/utils/constants';

export const MenuLandingDesktop: React.FC = () => (
  <HStack>
    <ChakraLink
      display="block"
      _hover={{}}
      isExternal
      href={QUESTCHAINS__APP_URL}
    >
      <Button fontSize={20} cursor="pointer" fontFamily="headingLight">
        Enter App
      </Button>
    </ChakraLink>

    <Link
      activeClass="active"
      to="what"
      spy={true}
      smooth={true}
      duration={500}
    >
      <Text fontSize={20} ml={3} cursor="pointer" fontFamily="headingLight">
        What
      </Text>
    </Link>
    <Link activeClass="active" to="who" spy={true} smooth={true} duration={500}>
      <Text fontSize={20} ml={3} cursor="pointer" fontFamily="headingLight">
        Who
      </Text>
    </Link>
    <Link activeClass="active" to="how" spy={true} smooth={true} duration={500}>
      <Text fontSize={20} ml={3} cursor="pointer" fontFamily="headingLight">
        How
      </Text>
    </Link>
    <Link
      activeClass="active"
      to="creators"
      spy={true}
      smooth={true}
      duration={500}
      offset={-70}
    >
      <Text fontSize={20} ml={3} cursor="pointer" fontFamily="headingLight">
        Creators
      </Text>
    </Link>
    <Link
      activeClass="active"
      to="questers"
      spy={true}
      smooth={true}
      duration={500}
      offset={-110}
    >
      <Text fontSize={20} ml={3} cursor="pointer" fontFamily="headingLight">
        Questers
      </Text>
    </Link>
    <Link
      activeClass="active"
      to="team"
      spy={true}
      smooth={true}
      duration={500}
    >
      <Text fontSize={20} ml={3} cursor="pointer" fontFamily="headingLight">
        Team
      </Text>
    </Link>
  </HStack>
);
