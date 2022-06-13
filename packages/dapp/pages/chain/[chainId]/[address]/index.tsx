import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { Signer } from 'ethers';
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { AddQuestBlock } from '@/components/AddQuestBlock';
import { CollapsableQuestDisplay } from '@/components/CollapsableQuestDisplay';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { NetworkDisplay } from '@/components/NetworkDisplay';
import { Role, RoleTag } from '@/components/RoleTag';
import { UploadProof } from '@/components/UploadProof';
import { UserDisplay } from '@/components/UserDisplay';
import {
  getQuestChainAddresses,
  getQuestChainInfo,
} from '@/graphql/questChains';
import { Status } from '@/graphql/types';
import { useLatestQuestChainData } from '@/hooks/useLatestQuestChainData';
import { useLatestQuestStatusesForUserAndChainData } from '@/hooks/useLatestQuestStatusesForUserAndChainData';
import { QuestChain, QuestChain__factory } from '@/types';
import { ZERO_ADDRESS } from '@/utils/constants';
import { waitUntilBlock } from '@/utils/graphHelpers';
import { handleError, handleTxLoading } from '@/utils/helpers';
import { Metadata, uploadMetadataViaAPI } from '@/utils/metadata';
import { SUPPORTED_NETWORK_INFO, useWallet } from '@/web3';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

type UserStatusType = {
  [questId: string]: {
    submissions: {
      description: string | undefined | null;
      externalUrl: string | undefined | null;
      timestamp: string;
    }[];
    reviews: {
      description: string | undefined | null;
      externalUrl: string | undefined | null;
      timestamp: string;
      reviewer: string;
      accepted: boolean;
    }[];
    status: Status;
  };
};

const QuestChainPage: React.FC<Props> = ({ questChain: inputQuestChain }) => {
  const { isFallback } = useRouter();
  const { address, chainId, provider } = useWallet();

  const {
    isOpen: isUpdateQuestConfirmationOpen,
    onOpen: onUpdateQuestConfirmationOpen,
    onClose: onUpdateQuestConfirmationClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateQuestChainConfirmationOpen,
    onOpen: onUpdateQuestChainConfirmationOpen,
    onClose: onUpdateQuestChainConfirmationClose,
  } = useDisclosure();
  const {
    isOpen: isOpenCreateQuest,
    onOpen: onOpenCreateQuest,
    onClose: onCloseCreateQUest,
  } = useDisclosure();

  const [isEditingQuestChain, setEditingQuestChain] = useState(false);
  const [isEditingQuest, setEditingQuest] = useState(false);

  const {
    questChain,
    fetching: fetchingQuests,
    refresh: refreshQuests,
  } = useLatestQuestChainData(inputQuestChain);

  const [chainName, setChainName] = useState(questChain?.name || '');
  const [chainDescription, setChainDescription] = useState(
    questChain?.description || '',
  );

  const [questName, setQuestName] = useState('');
  const [questDescription, setQuestDescription] = useState('');

  const [questEditId, setQuestEditId] = useState(0);

  const {
    questStatuses,
    fetching: fetchingStatus,
    refresh: refreshStatus,
  } = useLatestQuestStatusesForUserAndChainData(
    questChain?.chainId,
    questChain?.address,
    address,
  );

  const isOwner: boolean = useMemo(
    () =>
      questChain?.owners.some(
        ({ address: a }) => a === address?.toLowerCase(),
      ) ?? false,
    [questChain, address],
  );
  const isAdmin: boolean = useMemo(
    () =>
      questChain?.admins.some(
        ({ address: a }) => a === address?.toLowerCase(),
      ) ?? false,
    [questChain, address],
  );
  const isEditor: boolean = useMemo(
    () =>
      questChain?.editors.some(
        ({ address: a }) => a === address?.toLowerCase(),
      ) ?? false,
    [questChain, address],
  );
  const isReviewer: boolean = useMemo(
    () =>
      questChain?.editors.some(
        ({ address: a }) => a === address?.toLowerCase(),
      ) ?? false,
    [questChain, address],
  );

  const members: {
    [addr: string]: Role;
  } = useMemo(() => {
    const memberRoles: { [addr: string]: Role } = {};

    questChain?.reviewers.forEach(({ address }) => {
      memberRoles[address] = 'Reviewer';
    });

    questChain?.editors.forEach(({ address }) => {
      memberRoles[address] = 'Editor';
    });

    questChain?.admins.forEach(({ address }) => {
      memberRoles[address] = 'Admin';
    });

    questChain?.owners.forEach(({ address }) => {
      memberRoles[address] = 'Owner';
    });

    return memberRoles;
  }, [questChain]);

  const isUser = !(isOwner || isAdmin || isEditor || isReviewer);

  const userStatus: UserStatusType = useMemo(() => {
    const userStat: UserStatusType = {};
    questStatuses.forEach(item => {
      userStat[item.quest.questId] = {
        status: item.status,
        submissions: item.submissions.map(sub => ({
          description: sub.description,
          externalUrl: sub.externalUrl,
          timestamp: sub.timestamp,
        })),
        reviews: item.reviews.map(sub => ({
          description: sub.description,
          externalUrl: sub.externalUrl,
          timestamp: sub.timestamp,
          accepted: sub.accepted,
          reviewer: sub.reviewer.id,
        })),
      };
    });
    return userStat;
  }, [questStatuses]);

  const canMint = useMemo(
    () =>
      !!address &&
      questChain?.token &&
      !questChain.token.owners.find(o => o.id === address.toLowerCase()) &&
      Object.values(userStatus).length > 0 &&
      Object.values(userStatus).reduce(
        (t, v) => t && v.status === Status.Pass,
        true,
      ),
    [questChain, address, userStatus],
  );

  const fetching = fetchingStatus || fetchingQuests;

  const refresh = useCallback(() => {
    refreshStatus();
    refreshQuests();
  }, [refreshQuests, refreshStatus]);

  const contract: QuestChain = QuestChain__factory.connect(
    questChain?.address ?? ZERO_ADDRESS,
    provider?.getSigner() as Signer,
  );

  const [isSubmittingQuest, setSubmittingQuest] = useState(false);
  const [isSubmittingQuestChain, setSubmittingQuestChain] = useState(false);

  const onSubmitQuestChain = useCallback(
    async ({ name, description }: { name: string; description: string }) => {
      if (!chainId || chainId !== questChain?.chainId) return;
      setSubmittingQuestChain(true);
      const metadata: Metadata = {
        name,
        description,
      };
      let tid = toast.loading('Uploading metadata to IPFS via web3.storage');
      try {
        const hash = await uploadMetadataViaAPI(metadata);
        const details = `ipfs://${hash}`;
        toast.dismiss(tid);
        tid = toast.loading(
          'Waiting for Confirmation - Confirm the transaction in your Wallet',
        );
        const tx = await contract.edit(details);
        toast.dismiss(tid);
        tid = handleTxLoading(tx.hash, chainId);
        const receipt = await tx.wait(1);
        toast.dismiss(tid);
        tid = toast.loading(
          'Transaction confirmed. Waiting for The Graph to index the transaction data.',
        );
        await waitUntilBlock(chainId, receipt.blockNumber);
        toast.dismiss(tid);
        toast.success(`Successfully updated the Quest Chain: ${name}`);
        refresh();
      } catch (error) {
        toast.dismiss(tid);
        handleError(error);
      }

      setEditingQuestChain(false);
      setSubmittingQuestChain(false);
    },
    [contract, refresh, chainId, questChain],
  );

  const onSubmitQuest = useCallback(
    async ({
      name,
      description,
      questId,
    }: {
      name: string;
      description: string;
      questId: number;
    }) => {
      if (!chainId || chainId !== questChain?.chainId) return;
      setSubmittingQuest(true);
      const metadata: Metadata = {
        name,
        description,
      };
      let tid = toast.loading('Uploading metadata to IPFS via web3.storage');
      try {
        const hash = await uploadMetadataViaAPI(metadata);
        const details = `ipfs://${hash}`;
        toast.dismiss(tid);
        tid = toast.loading(
          'Waiting for Confirmation - Confirm the transaction in your Wallet',
        );
        const tx = await contract.editQuest(questId, details);
        toast.dismiss(tid);
        tid = handleTxLoading(tx.hash, chainId);
        const receipt = await tx.wait(1);
        toast.dismiss(tid);
        tid = toast.loading(
          'Transaction confirmed. Waiting for The Graph to index the transaction data.',
        );
        await waitUntilBlock(chainId, receipt.blockNumber);
        toast.dismiss(tid);
        toast.success(`Successfully updated the Quest: ${name}`);
        refresh();
      } catch (error) {
        toast.dismiss(tid);
        handleError(error);
      }

      setEditingQuest(false);
      setSubmittingQuest(false);
    },
    [contract, refresh, chainId, questChain],
  );

  const [minting, setMinting] = useState(false);

  const onMint = useCallback(async () => {
    if (!chainId || chainId !== questChain?.chainId || !address) return;
    setMinting(true);
    let tid = toast.loading(
      'Waiting for Confirmation - Confirm the transaction in your Wallet',
    );
    try {
      const tx = await contract.mintToken(address);
      toast.dismiss(tid);
      tid = handleTxLoading(tx.hash, chainId);
      const receipt = await tx.wait(1);
      toast.dismiss(tid);
      tid = toast.loading(
        'Transaction confirmed. Waiting for The Graph to index the transaction data.',
      );
      await waitUntilBlock(chainId, receipt.blockNumber);
      toast.dismiss(tid);
      toast.success(`Successfully minted your NFT`);
      refresh();
    } catch (error) {
      toast.dismiss(tid);
      handleError(error);
    }

    setMinting(false);
  }, [contract, refresh, chainId, questChain, address]);

  if (isFallback) {
    return (
      <VStack>
        <Spinner color="main" />
      </VStack>
    );
  }
  if (!questChain) {
    return (
      <VStack>
        <Text> Quest Chain not found! </Text>
      </VStack>
    );
  }

  return (
    <VStack w="100%" align="flex-start" color="main" px={{ base: 8, lg: 40 }}>
      <Head>
        <title>
          {questChain.name} - {SUPPORTED_NETWORK_INFO[questChain.chainId].name}
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Flex flexDirection="column" w="full" justify="center">
        <Flex justifyContent="space-between" w="full">
          {!isEditingQuestChain && (
            <>
              <Flex gap={3}>
                <Text fontSize="2xl" fontWeight="bold" mb={3}>
                  {questChain.name}
                </Text>
                <NetworkDisplay asTag chainId={questChain.chainId} />
              </Flex>
              {isAdmin && chainId === questChain.chainId && (
                <IconButton
                  borderRadius="full"
                  onClick={() => {
                    setEditingQuestChain(true);
                    setChainName(questChain.name || '');
                    setQuestDescription(questChain.description || '');
                  }}
                  icon={<EditIcon boxSize="1rem" />}
                  aria-label={''}
                />
              )}
            </>
          )}

          {isEditingQuestChain && (
            <>
              <Input
                fontSize="2xl"
                fontWeight="bold"
                mb={3}
                value={chainName}
                onChange={e => setChainName(e.target.value)}
              />
              <IconButton
                borderRadius="full"
                onClick={onUpdateQuestChainConfirmationOpen}
                isDisabled={isSubmittingQuestChain}
                icon={<CheckIcon boxSize="1rem" />}
                aria-label={''}
                mx={2}
              />
              <IconButton
                borderRadius="full"
                onClick={() => setEditingQuestChain(false)}
                isDisabled={isSubmittingQuestChain}
                icon={<CloseIcon boxSize="1rem" />}
                aria-label={''}
              />
            </>
          )}
        </Flex>

        {!isEditingQuestChain && questChain.description && (
          <Flex w="100%">
            <MarkdownViewer markdown={questChain.description} />
          </Flex>
        )}

        {isEditingQuestChain && (
          <Flex w="100%">
            <MarkdownEditor
              value={chainDescription}
              onChange={setChainDescription}
            />
          </Flex>
        )}
        <VStack spacing={2} align="flex-start" pt={4}>
          <Text>Members</Text>
          {Object.entries(members).map(([address, role]) => (
            <HStack key={address} spacing={2}>
              <UserDisplay address={address} color="white" />
              <RoleTag role={role} />
            </HStack>
          ))}
        </VStack>

        <ConfirmationModal
          onSubmit={() => {
            onUpdateQuestChainConfirmationClose();
            onSubmitQuestChain({
              name: chainName,
              description: chainDescription,
            });
          }}
          title="Update Quest Chain"
          content="Are you sure you want to update this quest chain?"
          isOpen={isUpdateQuestChainConfirmationOpen}
          onClose={onUpdateQuestChainConfirmationClose}
        />
      </Flex>

      {canMint && (
        <VStack pt={6}>
          <Button
            isLoading={minting}
            onClick={onMint}
            background="whiteAlpha.50"
            fontWeight="400"
            borderRadius="full"
            backdropFilter="blur(40px)"
            boxShadow="inset 0px 0px 0px 1px #AD90FF"
            color="main"
            _hover={{
              background: 'whiteAlpha.200',
            }}
            size="lg"
          >
            Mint NFT
          </Button>
        </VStack>
      )}

      <SimpleGrid
        columns={isUser ? 1 : { base: 1, lg: 2 }}
        spacing={16}
        pt={8}
        w="100%"
      >
        <VStack spacing={6} px={isUser ? { base: 0, lg: 40 } : 0}>
          {fetching ? (
            <Spinner />
          ) : (
            <>
              <Flex justifyContent="space-between" w="full">
                <Text
                  w="full"
                  color="white"
                  fontSize={20}
                  textTransform="uppercase"
                >
                  {questChain.quests.length} Quest
                  {questChain.quests.length === 1 ? '' : 's'} found
                </Text>
                {(isAdmin || isEditor) && (
                  <Button onClick={onOpenCreateQuest}>Create Quest</Button>
                )}
              </Flex>

              <Modal isOpen={isOpenCreateQuest} onClose={onCloseCreateQUest}>
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent maxW="36rem">
                  <ModalHeader>Create Quest</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <AddQuestBlock
                      questChain={questChain}
                      refresh={refresh}
                      onClose={onCloseCreateQUest}
                    />
                  </ModalBody>
                </ModalContent>
              </Modal>

              {questChain.quests.map(quest => (
                <Flex
                  w="full"
                  boxShadow="inset 0px 0px 0px 1px #AD90FF"
                  p={8}
                  gap={3}
                  borderRadius={20}
                  align="stretch"
                  key={quest.questId}
                  justifyContent="space-between"
                >
                  <Flex flexDirection="column" w="full">
                    {!(isEditingQuest && questEditId === quest.questId) && (
                      <Flex justifyContent="space-between" w="full">
                        <CollapsableQuestDisplay {...quest} />
                        {(isAdmin || isEditor) && (
                          <IconButton
                            borderRadius="full"
                            onClick={() => {
                              setEditingQuest(true);
                              setQuestName(quest.name || '');
                              setQuestDescription(quest.description || '');
                              setQuestEditId(quest.questId);
                            }}
                            icon={<EditIcon boxSize="1rem" />}
                            aria-label={''}
                          />
                        )}
                      </Flex>
                    )}

                    {isEditingQuest && questEditId === quest.questId && (
                      <Flex flexDirection="column">
                        <Flex>
                          <Input
                            mb={3}
                            value={questName}
                            onChange={e => setQuestName(e.target.value)}
                          />
                          <IconButton
                            borderRadius="full"
                            onClick={onUpdateQuestConfirmationOpen}
                            isDisabled={isSubmittingQuest}
                            icon={<CheckIcon boxSize="1rem" />}
                            aria-label={''}
                            mx={2}
                          />
                          <IconButton
                            borderRadius="full"
                            onClick={() => setEditingQuest(false)}
                            isDisabled={isSubmittingQuest}
                            icon={<CloseIcon boxSize="1rem" />}
                            aria-label={''}
                          />
                          <ConfirmationModal
                            onSubmit={() => {
                              onUpdateQuestConfirmationClose();
                              onSubmitQuest({
                                name: questName,
                                description: questDescription,
                                questId: quest.questId,
                              });
                            }}
                            title="Update Quest"
                            content="Are you sure you want to update this quest?"
                            isOpen={isUpdateQuestConfirmationOpen}
                            onClose={() => {
                              setChainDescription(quest.description || '');
                              setChainName(quest.name || '');
                              onUpdateQuestConfirmationClose();
                            }}
                          />
                        </Flex>

                        <MarkdownEditor
                          value={questDescription}
                          onChange={setQuestDescription}
                        />
                      </Flex>
                    )}
                  </Flex>

                  {isUser && (
                    <>
                      {
                        // TODO: Also display prev submissions and reviews here
                        !userStatus[quest.questId]?.status ||
                        userStatus[quest.questId]?.status === 'init' ||
                        userStatus[quest.questId]?.status === 'fail' ? (
                          <UploadProof
                            // TODO: move the modal inside this outside so that we don't render a new Modal for each quest
                            address={address}
                            questId={quest.questId}
                            questChainId={questChain.chainId}
                            questChainAddress={questChain.address}
                            name={quest.name}
                            refresh={refresh}
                          />
                        ) : (
                          <Box>
                            <Button
                              pointerEvents="none"
                              _hover={{}}
                              cursor="default"
                              color={
                                userStatus[quest.questId]?.status === 'review'
                                  ? 'pending'
                                  : 'main'
                              }
                              border="1px solid"
                              borderColor={
                                userStatus[quest.questId]?.status === 'review'
                                  ? 'pending'
                                  : 'main'
                              }
                            >
                              {userStatus[quest.questId]?.status === 'review'
                                ? 'Review Pending'
                                : 'Accepted'}
                            </Button>
                          </Box>
                        )
                      }
                    </>
                  )}
                </Flex>
              ))}
            </>
          )}
        </VStack>
      </SimpleGrid>
    </VStack>
  );
};

type QueryParams = { address: string; chainId: string };

export async function getStaticPaths() {
  const paths: { params: QueryParams }[] = [];

  await Promise.all(
    Object.keys(SUPPORTED_NETWORK_INFO).map(async chainId => {
      const addresses = await getQuestChainAddresses(chainId, 1000);

      paths.push(
        ...addresses.map(address => ({
          params: { address, chainId },
        })),
      );
    }),
  );

  return { paths, fallback: true };
}

export const getStaticProps = async (
  context: GetStaticPropsContext<QueryParams>,
) => {
  const address = context.params?.address;
  const chainId = context.params?.chainId;

  let questChain = null;
  if (address && chainId) {
    try {
      questChain = address ? await getQuestChainInfo(chainId, address) : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Could not fetch Quest Chain for address ${address}`,
        error,
      );
    }
  }

  return {
    props: {
      questChain,
    },
    revalidate: 1,
  };
};

export default QuestChainPage;
