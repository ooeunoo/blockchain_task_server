import { CHAIN_ID } from '@libs/helper/blockchain';

export const INFO = {
  [CHAIN_ID.ETH]: {
    farm: {
      name: 'farm',
      address: '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd',
    },
    farm2: {
      name: 'farm2',
      address: '0xef0881ec094552b2e128cf945ef17a6752b4ec5d',
    },
    amm: {
      factory_address: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
      factory_init_code_hash:
        '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    },
  },
  [CHAIN_ID.BSC]: {
    amm: {
      factory_address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      factory_init_code_hash:
        '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    },
  },
  [CHAIN_ID.XDAI]: {
    amm: {
      factory_address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      factory_init_code_hash:
        '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    },
  },
  [CHAIN_ID.HECO]: {
    amm: {
      factory_address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      factory_init_code_hash:
        '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    },
  },
  [CHAIN_ID.MATIC]: {
    farm: {
      name: 'farm',
      address: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
    },
    farm_rewarder: {
      name: 'farm_rewarder',
      sample_address: '0xa3378Ca78633B3b9b2255EAa26748770211163AE',
    },
    amm: {
      factory_address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      factory_init_code_hash:
        '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    },
  },
  [CHAIN_ID.FANTOM]: {
    amm: {
      factory_address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      factory_init_code_hash:
        '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    },
  },
};
