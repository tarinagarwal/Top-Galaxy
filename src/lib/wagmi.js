import { http, createConfig } from 'wagmi';
import { bscTestnet, bsc } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [
    injected(), // MetaMask, Trust Wallet, etc.
  ],
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
});

export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_BSC_CHAIN_ID || 97);
