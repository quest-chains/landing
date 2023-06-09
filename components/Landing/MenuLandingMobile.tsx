import {
  Button,
  Flex,
  Link as ChakraLink,
  Modal,
  ModalBody,
  ModalContent,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-scroll';

import { QUESTCHAINS__APP_URL } from '@/utils/constants';

import { NavToggle } from '../Layout/NavToggle';

export const MenuLandingMobile: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(o => !o);

  return (
    <>
      <Portal>
        <NavToggle isOpen={isOpen} onClick={toggleOpen} />
      </Portal>

      <Modal isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent
          minW="100%"
          h="100%"
          minH="100%"
          m={0}
          p={0}
          borderRadius={0}
        >
          <ModalBody h="100%">
            <Flex
              flexDir="column"
              alignItems="center"
              h="full"
              justifyContent="center"
              gap={4}
            >
              <ChakraLink
                display="block"
                _hover={{}}
                isExternal
                href={QUESTCHAINS__APP_URL}
              >
                <Button
                  fontSize={20}
                  cursor="pointer"
                  fontFamily="headingLight"
                  onClick={toggleOpen}
                >
                  Enter App
                </Button>
              </ChakraLink>

              <Link
                activeClass="active"
                onClick={toggleOpen}
                to="what"
                spy={true}
                smooth={true}
                duration={500}
              >
                <Text
                  fontSize={20}
                  ml={3}
                  cursor="pointer"
                  fontFamily="headingLight"
                >
                  What
                </Text>
              </Link>
              <Link
                activeClass="active"
                onClick={toggleOpen}
                to="who"
                spy={true}
                smooth={true}
                duration={500}
              >
                <Text
                  fontSize={20}
                  ml={3}
                  cursor="pointer"
                  fontFamily="headingLight"
                >
                  Who
                </Text>
              </Link>
              <Link
                activeClass="active"
                onClick={toggleOpen}
                to="how"
                spy={true}
                smooth={true}
                duration={500}
              >
                <Text
                  fontSize={20}
                  ml={3}
                  cursor="pointer"
                  fontFamily="headingLight"
                >
                  How
                </Text>
              </Link>
              <Link
                activeClass="active"
                onClick={toggleOpen}
                to="creators"
                spy={true}
                smooth={true}
                duration={500}
                offset={-70}
              >
                <Text
                  fontSize={20}
                  ml={3}
                  cursor="pointer"
                  fontFamily="headingLight"
                >
                  Creators
                </Text>
              </Link>
              <Link
                activeClass="active"
                onClick={toggleOpen}
                to="questers"
                spy={true}
                smooth={true}
                duration={500}
                offset={-110}
              >
                <Text
                  fontSize={20}
                  ml={3}
                  cursor="pointer"
                  fontFamily="headingLight"
                >
                  Questers
                </Text>
              </Link>
              <Link
                activeClass="active"
                onClick={toggleOpen}
                to="team"
                spy={true}
                smooth={true}
                duration={500}
              >
                <Text
                  fontSize={20}
                  ml={3}
                  cursor="pointer"
                  fontFamily="headingLight"
                >
                  Team
                </Text>
              </Link>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
