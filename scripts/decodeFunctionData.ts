import { ethers } from 'ethers';

function main() {
  const data =
    '0x095ea7b300000000000000000000000011333c997a420dc7638b5876db53965751c93bdcffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const abi = [
    {
      constant: false,
      inputs: [
        {
          name: '_spender',
          type: 'address',
        },
        {
          name: '_value',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const iface = new ethers.utils.Interface(abi);
  const result = iface.decodeFunctionData('approve', data);
  console.log(result);
}

main();
