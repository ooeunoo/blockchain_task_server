const { ethers } = require("hardhat");

const ethereumData = require("./data/ethereum.json");
const binanceSmartChainData = require("./data/binanceSmartChain.json");

const data = binanceSmartChainData;

describe("Multi Call", function () {
  let multiCall;

  before(async function () {
    const multiCallFactory = await ethers.getContractFactory("MultiCall");
    multiCall = await multiCallFactory.deploy();
    await multiCall.deployed();
    // multiCall = await ethers.getContractAt(
    //   "MultiCall",
    //   "0x80D8A5e6A6F81faBD8b59DAdD6474f532dCe3552"
    // );
  });

  xdescribe("Block", function () {
    // it('getBlockHash', async function () {
    //   const blockNumber = '100';
    //   const blockHash = await multiCall.getBlockHash(blockNumber);
    //   console.log(`getBlockHash: ${blockHash}`);
    // });
    it("getBlockNumber", async function () {
      const blockNumber = await multiCall.getBlockNumber();
      console.log(`getBlockNumber: ${blockNumber}`);
    });
    it("getCurrentBlockCoinbase", async function () {
      const coinbase = await multiCall.getCurrentBlockCoinbase();
      console.log(`getCurrentBlockCoinbase: ${coinbase}`);
    });
    it("getCurrentBlockDifficulty", async function () {
      const difficulty = await multiCall.getCurrentBlockDifficulty();
      console.log(`getCurrentBlockDifficulty: ${difficulty}`);
    });
    it("getCurrentBlockGasLimit", async function () {
      const gasLimit = await multiCall.getCurrentBlockGasLimit();
      console.log(`getCurrentBlockGasLimit: ${gasLimit}`);
    });
    it("getLastBlockHash", async function () {
      const lastBlockHash = await multiCall.getLastBlockHash();
      console.log(`getLastBlockHash: ${lastBlockHash}`);
    });
    // it('getBlockBaseFee', async function () {
    //   const baseFee = await multiCall.getBlockBaseFee();
    //   console.log(`getBlockBaseFee: ${baseFee}`);
    // });
    it("getChainId", async function () {
      const chainId = await multiCall.getChainId();
      console.log(`getChainId: ${chainId}`);
    });
  });
  xdescribe("Pair", function () {
    it("getBatchPairInfos", async function () {
      const pairInfos = await multiCall.safePairInfo(
        "0x7343b25c4953f4C57ED4D16c33cbEDEFAE9E8Eb9"
      );
      console.log(pairInfos);
    });
    it("isPair", async function () {
      // '0x6D1222277fc309c71350f1da9E0F7B26af98fACb',
      // '0x82957BD2c7f5a6944B160767ed7BA77d3e479f4C',
      // '0x7848c32060841CeABBA5CFAD505d88Cd2B9343aC',
      // '0xcf53963F36bEB4eE2Abb989f58b79AF70937e614',
      const isPair = await multiCall.isPair(
        "0x7343b25c4953f4C57ED4D16c33cbEDEFAE9E8Eb9"
      );
      console.log(isPair);
    });
    xit("getBatchIsPair", async function () {
      const isPair = await multiCall.getBatchIsPairs([
        "0x005e054F2a36aaf5E6B13163Ee9b9af531C3B23c",
        "0x009AB87D2E0b056FFd14dF6E4c9d820B7FA4b98B",
        "0x00A02E8AE70e1EE6b95900c162084111e54C8306",
        "0x00E7677a7B112AaEA497785C284575aB206cbFe7",
        "0x0101675b4B7889A05BA6CeE1Dd397D3909504930",
      ]);
      console.log(isPair);
    });
    xit("getBatchPairInfos", async function () {
      const pairInfos = await multiCall.getBatchPairInfos([
        "0xfdcbf476b286796706e273f86ac51163da737fa8",
        "0xfdcbf476b286796706e273f86ac51163da737fa8",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0xfdcbf476b286796706e273f86ac51163da737fa8",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0xfdcbf476b286796706e273f86ac51163da737fa8",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0xfdcbf476b286796706e273f86ac51163da737fa8",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0x60270a3b7c4be0aff35299fe401c612cb7e1e173",
        "0xfdcbf476b286796706e273f86ac51163da737fa8",
      ]);
      console.log(pairInfos);
    });
  });

  describe("Token", function () {
    xit("safeTokenName", async function () {
      const tokenName = await multiCall.safeERC20Name(
        "0x12e2fcfA079Fc23aE82Ab82707b402410321103f"
      );
      console.log(tokenName);
    });

    xit("safeTokenSymbol", async function () {
      const tokenSymbol = await multiCall.safeERC20Symbol(
        "0x0df8810714Dde679107c01503E200cE300d0DCf6"
      );
      console.log(tokenSymbol);
    });
    xit("safeTokenDecimals", async function () {
      const tokenDecimals = await multiCall.safeERC20Decimals(
        "0x0df8810714Dde679107c01503E200cE300d0DCf6"
      );
      console.log(tokenDecimals);
    });
    xit("safeTokenTotalSupply", async function () {
      const tokenTotalSupply = await multiCall.safeERC20TotalSupply(
        "0x0df8810714Dde679107c01503E200cE300d0DCf6"
      );
      console.log(tokenTotalSupply);
    });

    xit("getERC20TokenInfos", async function () {
      const tokenInfo = await multiCall.getERC20TokenInfos(
        "0x0268f0dd879cEa41210B8191149D06Bd318a56E7"
      );
      console.log(tokenInfo);
    });

    xit("getBatchERC20TokenInfos", async function () {
      const tokenInfos = await multiCall.getBatchERC20Infos([
        "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
        "0x0000000000b3F879cb30FE243b4Dfee438691c04",
        "0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1",
        "0x0268f0dd879cEa41210B8191149D06Bd318a56E7",
        "0x02ba7b2026D26896bc1368e6bEf4349d2f595B68",
        "0x031BBeCC1b4a541aA8170E3dFbbD51c279BF4368",
        "0x033239F51c751e688B12681fb3CcF286b3818A69",
        "0x035bfe6057E15Ea692c0DfdcaB3BB41a64Dd2aD4",
        "0x037A54AaB062628C9Bbae1FDB1583c195585fe41",
        "0x038842613c484E868C5c296C333a5aCa336453d7",
        "0x03ACa1181ade0509Fd3E7175E5895a2Fba90cEEA",
        "0x041f79a26C5DB2cda8716eA2Ff0b26c33e718E3f",
      ]);
      console.log(tokenInfos);
    });
    xit("getBatchERC20TokenBalances", async function () {
      const tokenBalances = await multiCall.getBatchERC20Balances(
        ["0x8cc7bc33f5188b1fb683bedc4dbffa77b136833b"],
        [
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
          "0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD",
        ]
      );
      console.log(tokenBalances);
    });
  });
  xdescribe("ERC721", function () {
    // it("safeERC721OwnerOf", async function () {
    //   const ownerOf = await multiCall.safeERC721OwnerOf(
    //     "0x43db8ea81074b31cf2665b600a4086cf36b59445",
    //     5465
    //   );
    //   console.log(ownerOf);
    // });
    xit("safeERC721TokenURI", async function () {
      const tokenURI = await multiCall.safeERC721TokenURI(
        "0x43DB8ea81074b31Cf2665B600A4086cF36B59445",
        5465
      );
      console.log(tokenURI);
    });
    it("getBatchERC721Infos", async function () {
      const erc721infos = await multiCall.getBatchERC721Infos(
        "0x1dfe7ca09e99d10835bf73044a23b73fc20623df",
        [1]
      );
      console.log(erc721infos);
    });
  });
  xdescribe("ChainLink", function () {
    it("getBatchChainLinkData", async function () {
      const chainLinkData = await multiCall.getBatchChainLinkData(data.feeds);
      console.log(chainLinkData);
    });
  });
  xdescribe("Aggregator", function () {
    it("staticAggregate", async function () {
      const calls = [
        [
          "0x55d398326f99059ff775485246999027b3197955", // pancakeSwap master contract
          "0x70a082310000000000000000000000008894e0a0c962cb723c1976a4421c95949be2d4e3", // userInfo(0, 0xae462eb21e54b62d24f957ede25a414c08212318)
        ],
      ];

      const staticAggregateData = await multiCall.staticAggregate(false, calls);
      console.log(staticAggregateData);
    });
  });
});
