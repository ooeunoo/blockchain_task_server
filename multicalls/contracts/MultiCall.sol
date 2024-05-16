pragma solidity 0.8.7;
pragma experimental ABIEncoderV2;

library Helper {
  function isEmptyBytes(bytes memory _bytes) internal pure returns (bool) {
    return _bytes.length == 0;
  }
}

abstract contract Constant  {
  string public UNKNOWN_STRING = "UNKNOWN";
  uint256 public UNKNOWN_UINT = 0;
  address public UNKNOWN_ADDRESS = address(0);
}

abstract contract Block {
  function getBlockHash(uint256 blockNumber) public view returns (bytes32 blockHash) {
    blockHash = blockhash(blockNumber);
  }

  function getBlockNumber() public view returns (uint256 blockNumber) {
    blockNumber = block.number;
  }

  function getCurrentBlockCoinbase() public view returns (address coinbase) {
    coinbase = block.coinbase;
  }

  function getCurrentBlockDifficulty() public view returns (uint256 difficulty) {
    difficulty = block.difficulty;
  }

  function getCurrentBlockGasLimit() public view returns (uint256 gaslimit) {
    gaslimit = block.gaslimit;
  }

  function getCurrentBlockTimestamp() public view returns (uint256 timestamp) {
    timestamp = block.timestamp;
  }

  function getLastBlockHash() public view returns (bytes32 blockHash) {
    blockHash = blockhash(block.number - 1);
  }

  function getBlockBaseFee() public view returns (uint256 baseFee) {
    require(getChainId() == 1, "Unable to get baseFee");
    baseFee = block.basefee;
  }

  function getChainId() public view returns (uint256 chainId) {
    chainId = block.chainid;
  }
}

abstract contract Pair is Constant {
  struct PairInfo {
    address pair;
    address token0;
    address token1;
  }

  function isPair(address pair) public view returns (bool) {
    (bool token0Success, bytes memory token0Data) = pair.staticcall(abi.encodeWithSelector(0x0dfe1681));
    (bool token1Success, bytes memory token1Data) = pair.staticcall(abi.encodeWithSelector(0xd21220a7));
    return token0Success && token1Success && !Helper.isEmptyBytes(token0Data) && !Helper.isEmptyBytes(token1Data);
  }

  function safePairInfo(address pair) public view returns (PairInfo memory) {
    (bool token0Success, bytes memory token0Data) = pair.staticcall(abi.encodeWithSelector(0x0dfe1681));
    (bool token1Success, bytes memory token1Data) = pair.staticcall(abi.encodeWithSelector(0xd21220a7));

    address token0Address = token0Success && !Helper.isEmptyBytes(token0Data) ? abi.decode(token0Data, (address)) : UNKNOWN_ADDRESS;
    address token1Address = token1Success && !Helper.isEmptyBytes(token0Data) ? abi.decode(token1Data, (address)) : UNKNOWN_ADDRESS;

    return PairInfo(pair, token0Address, token1Address);
  }

  function getBatchIsPairs(address[] memory _pairs) external view returns (bool[] memory _isPairs) {
    _isPairs = new bool[](_pairs.length);
    for (uint256 i = 0; i < _pairs.length; i++) {
      _isPairs[i] = isPair(_pairs[i]);
    }
  }

  function getBatchPairInfos(address[] memory _pairs) public view returns (PairInfo[] memory _pairInfos) {
    _pairInfos = new PairInfo[](_pairs.length);
    for (uint256 i = 0; i < _pairs.length; i++) {
      _pairInfos[i] = safePairInfo(_pairs[i]);
    }
  }
}

abstract contract ERC20 is Constant {
  struct ERC20Info {
    string name;
    string symbol;
    uint256 decimals;
  }

  struct BalanceInfo {
    address token;
    uint256 balance;
  }

  function safeERC20Name(address token) public view returns (string memory) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x06fdde03));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (string)) : UNKNOWN_STRING;
  }

  function safeERC20Symbol(address token) public view returns (string memory) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x95d89b41));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (string)) : UNKNOWN_STRING;
  }

  function safeERC20Decimals(address token) public view returns (uint256) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x313ce567));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (uint256)) : UNKNOWN_UINT;
  }

  function safeERC20TotalSupply(address token) public view returns (uint256) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x18160ddd));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (uint256)) : UNKNOWN_UINT;
  }

  function safeERC20BalanceOf(address token, address holder) public view returns (uint256) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x70a08231, holder));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (uint256)) : UNKNOWN_UINT;
  }

  function getBatchERC20TotalSupply(address[] memory _tokens) public view returns (uint256[] memory totalSupplies) {
    totalSupplies = new uint256[](_tokens.length);

    for (uint256 i = 0; i < _tokens.length; i++) {
      totalSupplies[i] = safeERC20TotalSupply(_tokens[i]);
    }
  }
  
  function getERC20TokenInfos(address _token) public view returns (ERC20Info memory tokenInfos) {
    return ERC20Info({name: safeERC20Name(_token), symbol: safeERC20Symbol(_token), decimals: safeERC20Decimals(_token)});
  }

  function getBatchERC20Infos(address[] memory _tokens) public view returns (ERC20Info[] memory tokenInfos) {
    tokenInfos = new ERC20Info[](_tokens.length);

    for (uint256 i = 0; i < _tokens.length; i++) {
      tokenInfos[i] = getERC20TokenInfos(_tokens[i]);
    }
  }

  function getBatchERC20Balances(address[] memory users, address[] memory tokens) external view returns (uint256[] memory addrBalances) {
    addrBalances = new uint256[](tokens.length * users.length);

    for (uint256 i = 0; i < users.length; i++) {
      for (uint256 j = 0; j < tokens.length; j++) {
        uint256 addrIdx = j + tokens.length * i;
        if (tokens[j] != address(0x0)) {
          addrBalances[addrIdx] = safeERC20BalanceOf(tokens[j], users[i]);
        } else {
          addrBalances[addrIdx] = users[i].balance;
        }
      }
    }
  }
}

abstract contract ERC721 is Constant {
  struct ERC721Info {
    uint256 id;
    address owner;
    string tokenURI;
  }

  function safeERC721OwnerOf(address token, uint256 id) public view returns (address) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x6352211e, id));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (address)) : UNKNOWN_ADDRESS;
  }

  function safeERC721TokenURI(address token, uint256 id) public view returns (string memory) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0xc87b56dd, id));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (string)) : UNKNOWN_STRING;
  }

  function safeERC721BalanceOf(address token, address holder) public view returns (uint256) {
    (bool success, bytes memory data) = token.staticcall(abi.encodeWithSelector(0x70a08231, holder));
    return success && !Helper.isEmptyBytes(data) ? abi.decode(data, (uint256)) : UNKNOWN_UINT;
  }

  function safeERC721TokenByIndex(address token, uint256 index) public view returns (uint256) {
    (bool success , bytes memory data) = token.staticcall(abi.encodeWithSelector(0x4f6ccce7, index));
    require(success && !Helper.isEmptyBytes(data), "invalid index");
    return abi.decode(data, (uint256));
  }

  function getSafeERC721Infos(address _token, uint256 _index) public view returns (ERC721Info memory erc721Infos) {
    uint256 id = safeERC721TokenByIndex(_token, _index);
    return ERC721Info({id: id, owner: safeERC721OwnerOf(_token, id), tokenURI: safeERC721TokenURI(_token, id)});
  }

  function getBatchERC721Infos(address _token, uint256[] memory _indexes) public view returns (ERC721Info[] memory erc721Infos) {
    erc721Infos = new ERC721Info[](_indexes.length);

    for (uint256 i = 0; i < _indexes.length; i++) {
      erc721Infos[i] = getSafeERC721Infos(_token, _indexes[i]);
    }
  }
}

abstract contract ChainLink is Constant {
  struct ChainLinkData {
    uint256 answer;
    uint256 decimals;
  }

  function safeChainLinkData(address feed) public view returns (ChainLinkData memory) {
    (bool roundDataSuccess, bytes memory roundData) = feed.staticcall(abi.encodeWithSelector(0xfeaf968c));
    (bool decimalDataSuccess, bytes memory decimalsData) = feed.staticcall(abi.encodeWithSelector(0x313ce567));

    (, uint256 answer, , , ) = roundDataSuccess && !Helper.isEmptyBytes(roundData)
      ? abi.decode(roundData, (uint80, uint256, uint256, uint256, uint80))
      : (0, UNKNOWN_UINT, 0, 0, 0);
    uint256 decimals = decimalDataSuccess && !Helper.isEmptyBytes(decimalsData) ? abi.decode(decimalsData, (uint256)) : 0;

    return ChainLinkData({answer: answer, decimals: decimals});
  }

  function getBatchChainLinkData(address[] memory _targetFeeds) public view returns (ChainLinkData[] memory _chainLinkData) {
    _chainLinkData = new ChainLinkData[](_targetFeeds.length);
    for (uint256 i = 0; i < _targetFeeds.length; i++) {
      address targetFeed = _targetFeeds[i];
      _chainLinkData[i] = safeChainLinkData(targetFeed);
    }
  }
}

abstract contract Address {
  function getCode(address target) public view returns (bytes memory code) {
    assembly {
      let size := extcodesize(target)
      code := mload(0x40)
      mstore(0x40, add(code, and(add(add(size, 0x20), 0x1f), not(0x1f))))
      mstore(code, size)
      extcodecopy(target, add(code, 0x20), 0, size)
    }
  }

  function checkCA(address target) public view returns (bool) {
    uint256 code;
    assembly {
      code := extcodesize(target)
    }
    return code > 0;
  }

  function getBatchGetCode(address[] memory _targetAddress) public view returns (bytes[] memory code) {
    code = new bytes[](_targetAddress.length);
    for (uint256 i = 0; i < _targetAddress.length; i++) {
      code[i] = getCode(_targetAddress[i]);
    }
  }

  function getBatchCheckCA(address[] memory _targetAddress) public view returns (bool[] memory result) {
    result = new bool[](_targetAddress.length);
    for (uint256 i = 0; i < _targetAddress.length; i++) {
      result[i] = checkCA(_targetAddress[i]);
    }
  }
}

abstract contract Aggregator {
  struct Call {
    address target;
    bytes callData;
  }

  struct Result {
    bool success;
    bytes returnData;
  }

  function aggregate(bool requireSuccess, Call[] memory calls) public returns (Result[] memory returnData) {
    returnData = new Result[](calls.length);
    for (uint256 i = 0; i < calls.length; i++) {
      (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);

      if (requireSuccess) {
        require(success, "multicall aggregate: call failed");
      }

      returnData[i] = Result(success, ret);
    }
  }

  function staticAggregate(bool requireSuccess, Call[] memory calls) public view returns (Result[] memory returnData) {
    returnData = new Result[](calls.length);
    for (uint256 i = 0; i < calls.length; i++) {
      (bool success, bytes memory ret) = calls[i].target.staticcall(calls[i].callData);

      if (requireSuccess) {
        require(success, "multicall aggregate: call failed");
      }

      returnData[i] = Result(success, ret);
    }
  }
}

contract MultiCall is Block, Pair, ERC20, ERC721, Address, ChainLink, Aggregator {}
