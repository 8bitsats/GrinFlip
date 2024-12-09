// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

import { useMemo } from 'react';

import { Toaster } from 'react-hot-toast';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import { Game } from './components/Game';
import { HELIUS_RPC_URL } from './lib/config';
import { walletConfig } from './lib/wallet-config';

function App() {
  // Set up endpoint
  const endpoint = useMemo(() => HELIUS_RPC_URL, []);

  // Get wallet configuration
  const { wallets, autoConnect, connectionConfig } = walletConfig;

  if (!endpoint) {
    return <div>Missing RPC endpoint configuration</div>;
  }

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={autoConnect}
        onError={(error) => {
          console.error('Wallet error:', error);
          // Add more detailed error logging
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
          }
        }}
      >
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-900 text-gray-100">
            <Game />
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#333',
                  color: '#fff',
                }
              }}
            />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
