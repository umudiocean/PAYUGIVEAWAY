export const CONTRACT_ADDRESS = '0x17A0D20Fc22c30a490FB6F186Cf2c31d738B5567' as const
export const PAYU_TOKEN = '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144' as const
export const ADMIN_WALLET = '0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a' as const
export const REGISTRATION_FEE = '980000000000000' // 0.00098 BNB in wei

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'indexOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'index', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'seed', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'reward', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'Registered',
    type: 'event',
  },
] as const

// Generate ticket from seed
export function generateTicket(seed: string): string {
  const hash = seed.slice(2, 11) // Remove 0x and take 9 chars
  return `PAYU-${hash.slice(0, 3)}-${hash.slice(3, 6)}-${hash.slice(6, 9)}`.toUpperCase()
}
