// Minimal ABIs for the contracts we interact with from the frontend.

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
];

export const DEPOSIT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'referralCode', type: 'string' },
    ],
    outputs: [],
  },
];

export const CONTRACT_ADDRESSES = {
  usdt: import.meta.env.VITE_USDT_CONTRACT,
  deposit: import.meta.env.VITE_DEPOSIT_CONTRACT,
  game: import.meta.env.VITE_GAME_CONTRACT,
  luckyDraw: import.meta.env.VITE_LUCKYDRAW_CONTRACT,
};

// Treasury + Withdrawal ABIs for admin withdraw via MetaMask
export const TREASURY_ABI = [
  { name: 'transferFunds', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'reason', type: 'string' }], outputs: [] },
];

export const WITHDRAWAL_ABI = [
  { name: 'processWithdrawal', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'netAmount', type: 'uint256' }, { name: 'fee', type: 'uint256' }], outputs: [] },
];

// DepositV2 admin setter ABIs — used by the admin config page to update
// on-chain wallet addresses directly from MetaMask (contract owner only).
export const DEPOSIT_V2_ADMIN_ABI = [
  { name: 'setCreatorWallet', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_wallet', type: 'address' }], outputs: [] },
  { name: 'setFEWWallet', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_wallet', type: 'address' }], outputs: [] },
  { name: 'setReferralPoolWallet', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_wallet', type: 'address' }], outputs: [] },
  { name: 'setLuckyDrawPoolWallet', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_wallet', type: 'address' }], outputs: [] },
  { name: 'setGamePoolWallet', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_wallet', type: 'address' }], outputs: [] },
  { name: 'setBDWallet', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'index', type: 'uint8' }, { name: 'wallet', type: 'address' }, { name: 'bps', type: 'uint16' }], outputs: [] },
];
