export enum ExceptionLevel {
  Normal = 'NORMAL',
  Fatal = 'FATAL',
}

export enum ExceptionCode {
  // 00 = Basic
  ERR000 = 'Internal server error',
  ERR001 = 'API not found',
  ERR002 = 'Validation error',
  ERR003 = '',
  ERR004 = '',
  ERR005 = '',
  ERR006 = '',
  ERR007 = '',
  ERR008 = '',
  ERR009 = '',
  // 01 = Network 관련 에러 모음
  ERR100 = 'Not found network',
  ERR101 = 'Invalid chainId',
  ERR102 = '',
  ERR103 = '',
  ERR104 = '',
  ERR105 = '',
  ERR106 = '',
  ERR107 = '',
  ERR108 = '',
  ERR109 = '',
  // 02 = Protocol 관련 에러 모음
  ERR200 = 'Not found protocol',
  ERR201 = '',
  ERR202 = '',
  ERR203 = '',
  ERR204 = '',
  ERR205 = '',
  ERR206 = '',
  ERR207 = '',
  ERR208 = '',
  ERR209 = '',
  // 03 = Token 관련 에러 모음
  ERR300 = '',
  ERR301 = '',
  ERR302 = '',
  ERR303 = '',
  ERR304 = '',
  ERR305 = '',
  ERR306 = '',
  ERR307 = '',
  ERR308 = '',
  ERR309 = '',
  // 04 = NF_Token 에러 모음
  ERR400 = '',
  ERR401 = '',
  ERR402 = '',
  ERR403 = '',
  ERR404 = '',
  ERR405 = '',
  ERR406 = '',
  ERR407 = '',
  ERR408 = '',
  ERR409 = '',
  // 05 = Farm 관련 에러 모음
  ERR500 = '',
  ERR501 = '',
  ERR502 = '',
  ERR503 = '',
  ERR504 = '',
  ERR505 = '',
  ERR506 = '',
  ERR507 = '',
  ERR508 = '',
  ERR509 = '',
  // 06 = Lending 관련 에러 모음
  ERR600 = '',
  ERR601 = '',
  ERR602 = '',
  ERR603 = '',
  ERR604 = '',
  ERR605 = '',
  ERR606 = '',
  ERR607 = '',
  ERR608 = '',
  ERR609 = '',
  // 07 = Interaction 관련 에러 모음
  ERR700 = 'Interacted address must be contract address',
  ERR701 = 'Not found interaction',
  ERR702 = '',
  ERR703 = '',
  ERR704 = '',
  ERR705 = '',
  ERR706 = '',
  ERR707 = '',
  ERR708 = '',
  ERR709 = '',
  // 08 = ABI 관련 에러 모음
  ERR800 = 'Not found abi',
  ERR801 = '',
  ERR802 = '',
  ERR803 = '',
  ERR804 = '',
  ERR805 = '',
  ERR806 = '',
  ERR807 = '',
  ERR808 = '',
  ERR809 = '',

  // 09 = Swap 관련 에러 모음
  ERR900 = 'Not found Input token',
  ERR901 = 'Not found output token',
  ERR902 = 'Not match chain id of input token and output token',
  ERR903 = 'Comparing incomparable trades',
  ERR904 = '',
  ERR905 = '',
  ERR906 = '',
  ERR907 = '',
  ERR908 = '',
  ERR909 = '',

  // 10 = Scheduler 관련 에러 모음
  ERR1000 = 'Not found scheduler',
  ERR1001 = 'Unknown exception',
  ERR1002 = 'missing response',
  ERR1003 = 'ETIMEDOUT',
  ERR1004 = 'could not detect network',
  ERR1005 = 'Expected rpc error',
  ERR1006 = 'Validation error',
  ERR1007 = 'missing revert data in call exception',
  ERR1008 = 'Too many connections',
  ERR1009 = 'Too Many Requests', // url: 'https://rpc-mainnet.maticvigil.com/', RPC request rate limit
  ERR1010 = 'processing response error',
}