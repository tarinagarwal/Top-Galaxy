// BSCScan explorer base URL — reads from env var at build time.
// Set VITE_BSCSCAN_URL in .env or Vercel to switch between testnet and mainnet:
//   Testnet: https://testnet.bscscan.com
//   Mainnet: https://bscscan.com
export const BSCSCAN_URL = import.meta.env.VITE_BSCSCAN_URL || 'https://bscscan.com';

// Helper to build a tx link
export const bscscanTx = (txHash) => `${BSCSCAN_URL}/tx/${txHash}`;

// Helper to build an address link
export const bscscanAddr = (addr) => `${BSCSCAN_URL}/address/${addr}`;
