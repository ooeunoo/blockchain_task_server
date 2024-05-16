import { CHAIN_ID } from '@libs/helper/blockchain';

export const INFO = {
  [CHAIN_ID.BSC]: {
    farm: {
      name: 'farm',
      address: '0x0895196562C7868C5Be92459FaE7f877ED450452',
    },
    farm_strat: {
      name: 'farm_strat',
      sample_address: '0x5D3E61EB616b0Ab2e8c6e8D1d98Cbee8C7A089A2',
    },
  },
  [CHAIN_ID.MATIC]: {
    farm: {
      name: 'farm',
      address: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
    },
  },
  [CHAIN_ID.HECO]: {
    farm: {
      name: 'farm',
      address: '0xFB03e11D93632D97a8981158A632Dd5986F5E909',
    },
  },
};
