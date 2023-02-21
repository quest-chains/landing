import { Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { QuestChainTile } from '@/components/QuestChainTile';
import { useQuestChainSearchForAllChains } from '@/hooks/useQuestChainSearchForAllChains';

import { LoadingState } from '../LoadingState';
import FilterDropdown from './FilterDropdown';
import Sort from './Sort';

export enum Category {
  All = 'All',
  NFT = 'NFT',
  GameFi = 'GameFi',
  DeFi = 'DeFi',
  DAO = 'DAO',
  SocialFi = 'SocialFi',
  Metaverse = 'Metaverse',
  Tools = 'Tools',
  Others = 'Others',
  Ecosystem = 'Ecosystem',
}

export enum Network {
  All = 'All',
  Polygon = 'Polygon',
  Optimism = 'Optimism',
  Arbitrum = 'Arbitrum',
  Gnosis = 'Gnosis',
}
export type Filter = Record<Category | Network, boolean>;

const QuestChains: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [sortBy, setSortBy] = useState('');

  const [categories, setCategories] = useState<Record<Category, boolean>>({
    [Category.All]: false,
    [Category.NFT]: false,
    [Category.GameFi]: false,
    [Category.DeFi]: false,
    [Category.DAO]: false,
    [Category.SocialFi]: false,
    [Category.Metaverse]: false,
    [Category.Tools]: false,
    [Category.Others]: false,
    [Category.Ecosystem]: false,
  });

  const [networks, setNetworks] = useState<Record<Network, boolean>>({
    [Network.All]: false,
    [Network.Polygon]: false,
    [Network.Optimism]: false,
    [Network.Arbitrum]: false,
    [Network.Gnosis]: false,
  });

  const { fetching, results, error } = useQuestChainSearchForAllChains('');

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error while searching for quest chains:', error);
  }

  return (
    <Flex alignItems="flex-start" gap={4} w="full" direction="column" mt={0}>
      <Flex
        w="full"
        justifyContent="space-between"
        direction={{
          base: 'column',
          md: 'row',
        }}
        gap={4}
        mb={4}
      >
        <HStack>
          <FilterDropdown
            filter={categories as Filter}
            setFilters={setCategories}
            label="Categories"
          />
          <FilterDropdown
            filter={networks as Filter}
            setFilters={setNetworks}
            label="Networks"
          />
        </HStack>
        <Sort sortBy={sortBy} setSortBy={setSortBy} />
      </Flex>

      <VStack w="full" gap={4} flex={1}>
        {fetching && <LoadingState my={12} />}

        <Grid
          gap={5}
          templateColumns={{
            base: 'repeat(1, 100%)',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          }}
          maxW="full"
        >
          {!fetching &&
            !error &&
            results.length > 0 &&
            results.map(
              ({
                address,
                name,
                description,
                slug,
                chainId,
                quests,
                imageUrl,
                createdBy,
              }) => (
                <QuestChainTile
                  {...{
                    address,
                    name,
                    description,
                    slug,
                    chainId,
                    createdBy: createdBy.id,
                    quests: quests.filter(q => !q.paused).length,
                    imageUrl,
                    onClick: onClose,
                  }}
                  key={address}
                />
              ),
            )}
        </Grid>
      </VStack>
    </Flex>
  );
};

export default QuestChains;
