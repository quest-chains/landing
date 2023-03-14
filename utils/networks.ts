import ArbitrumImage from './images/arbitrum.svg';
import GnosisImage from './images/gnosis.svg';
import OptimismImage from './images/optimism.svg';
import PolygonImage from './images/polygon.svg';

export type NetworkInfo = {
  [chainId: string]: {
    chainId: string;
    name: string;
    label: string;
    urlName: string;
    symbol: string;
    explorer: string;
    explorerLabel: string;
    rpc: string;
    image: string;
  };
};

export const SUPPORTED_NETWORK_INFO: NetworkInfo = {
  '0x89': {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    label: 'Polygon',
    urlName: 'polygon',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    explorerLabel: 'PolygonScan',
    rpc: `https://polygon-rpc.com`,
    image: PolygonImage.src,
  },
  '0x64': {
    chainId: '0x64',
    name: 'Gnosis Chain',
    label: 'Gnosis',
    urlName: 'gnosis',
    symbol: 'xDAI',
    explorer: 'https://gnosisscan.io',
    explorerLabel: 'GnosisScan',
    rpc: 'https://rpc.gnosischain.com/',
    image: GnosisImage.src,
  },
  '0xa': {
    chainId: '0xa',
    name: 'Optimism Mainnet',
    label: 'Optimism',
    urlName: 'optimism',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    explorerLabel: 'EtherScan',
    rpc: 'https://mainnet.optimism.io',
    image: OptimismImage.src,
  },
  '0xa4b1': {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    label: 'Arbitrum',
    urlName: 'arbitrum',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
    explorerLabel: 'ArbiScan',
    rpc: 'https://arb1.arbitrum.io/rpc',
    image: ArbitrumImage.src,
  },
};
