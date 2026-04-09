import { http, createConfig } from 'wagmi';
import { bscTestnet, bsc } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

const connectors = [
  injected(), // MetaMask, Trust Wallet browser extension, etc.
];

// Add WalletConnect if a project ID is configured — enables mobile wallet
// connections via QR code or deep-link without needing the wallet's in-app browser.
if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Top Galaxy',
        description: 'BSC Gaming Platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://top-galaxy.vercel.app',
        icons: [],
      },
    })
  );
}

export const config = createConfig({
  chains: [bscTestnet, bsc],
  connectors,
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
});

export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_BSC_CHAIN_ID || 97);
