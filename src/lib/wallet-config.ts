import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

export const network = WalletAdapterNetwork.Mainnet;

export const getPhantomWallet = () => {
    return new PhantomWalletAdapter({
        network,
    });
};

export const walletConfig = {
    network,
    wallets: [getPhantomWallet()],
    autoConnect: true,
    connectionConfig: {
        commitment: 'confirmed' as const,
        confirmTransactionInitialTimeout: 60000,
    },
};
