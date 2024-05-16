import { CHAIN_ID } from '@libs/helper/blockchain';

export const INFO = {
  [CHAIN_ID.BSC]: {
    // master chef
    farm: {
      name: 'farm',
      address: '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
    },
    // smart chef
    farm2: {
      name: 'farm2',
      address: '0x927158Be21Fe3D4da7E96931bb27Fd5059A8CbC2',
      sample_address: '0x09b8a5f51c9e245402057851ada274174fa00e2a',
      sub_graph_url:
        'https://api.thegraph.com/subgraphs/name/xtoken1/smartchef',
    },
    amm: {
      factory_address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      factory_init_code_hash:
        '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
      router_address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    },
    // pancake bunnies
    nf_token: {
      address: '0xDf7952B35f24aCF7fC0487D01c8d5690a60DBa07',
    },
    // pancake squad
    nf_token2: {
      address: '0x0a8901b0E25DEb55A87524f0cC164E9644020EBA',
    },
    // born bad boys
    nf_token3: {
      address: '0x44d85770aEa263F9463418708125Cd95e308299B',
    },
    // born bad girls
    nf_token4: {
      address: '0x3da8410e6EF658c06E277a2769816688c37496CF',
    },
    // shit punks
    nf_token5: {
      address: '0x11304895f41C5A9b7fBFb0C4B011A92f1020EF96',
    },
  },
};
