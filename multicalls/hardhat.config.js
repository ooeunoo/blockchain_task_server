require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        /* Ethereum */
        // url: "https://mainnet.infura.io/v3/a74ce6259ee749228b426a1ca28bfc9b",
        /* EthereumClassic */
        // url: 'https://www.ethercluster.com/etc',
        /* Binance Smart Chain */
        // url: "https://bsc-dataseed.binance.org/",
        // url: "https://bsc-dataseed1.binance.org/",
        url: "https://bsc-dataseed2.binance.org/",
        // url: "https://bsc-dataseed3.binance.org/",
        // url: "https://bsc-dataseed4.binance.org/",
        // url: "https://bsc-dataseed1.defibit.io/",
        // url: "https://bsc-dataseed2.defibit.io/",
        // url: "https://bsc-dataseed3.defibit.io/",
        // url: "https://bsc-dataseed4.defibit.io/",
        // url: "https://bsc-dataseed1.ninicoin.io/",
        // url: "https://bsc-dataseed2.ninicoin.io/",
        // url: "https://bsc-dataseed3.ninicoin.io/",
        // url: "https://eth-mainnet.alchemyapi.io/v2/7z_QMVkmgo5HTqFYrfYJqMr3PEoZNDC7",
        // httpHeaders: {
        //   Authorization: `Bearer ${process.env.OCTET_EXPLORER_API_TOKEN}`,
        // },
        // blockNumber: 10532202,
        /* Polygon */
        // url: "https://rpc-mainnet.maticvigil.com",
      },
      accounts: {
        mnemonic: "test test test test test test test test test junk junk junk",
        initialIndex: 0,
        accountsBalance: "100000000000000000000000000000000000", // 100,000,000,000,000,000 ETH
      },
    },
    /* For Ethereum Dev */
    ropsten: {
      url: "https://ropsten.infura.io/v3/a74ce6259ee749228b426a1ca28bfc9b",
      accounts: {
        mnemonic: "test test test test test test test test test junk junk junk",
        initialIndex: 0,
        accountsBalance: "100000000000000000000000000000000000", // 100,000,000,000,000,000 ETH
      },
    },
    goerli: {
      url: "https://goerli.infura.io/v3/a74ce6259ee749228b426a1ca28bfc9b",
      accounts: {
        mnemonic: "test test test test test test test test test junk junk junk",
        initialIndex: 0,
        accountsBalance: "100000000000000000000000000000000000", // 100,000,000,000,000,000 ETH
      },
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/a74ce6259ee749228b426a1ca28bfc9b",
      accounts: {
        mnemonic: "test test test test test test test test test junk junk junk",
        initialIndex: 0,
        accountsBalance: "100000000000000000000000000000000000", // 100,000,000,000,000,000 ETH
      },
    },

    /* For Live */
    ethereum: {
      url: "https://mainnet.infura.io/v3/a74ce6259ee749228b426a1ca28bfc9b",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
    binanceSmartChain: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
    ethereumClassic: {
      url: "https://www.ethercluster.com/etc",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
    xDai: {
      url: "https://rpc.xdaichain.com/",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
    heco: {
      url: "https://http-mainnet.hecochain.com",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
    klaytn: {
      url: "http://15.165.93.228:8551",

      accounts: { mnemonic: process.env.MNEMONIC },
    },
    fantom: {
      url: "https://rpcapi.fantom.network",
      accounts: { mnemonic: process.env.MNEMONIC },
    },
  },

  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 20000000,
  },
};
