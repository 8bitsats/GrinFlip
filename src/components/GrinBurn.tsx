import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { burnTokens, closeTokenAccount } from '../lib/token';
import { BurnAnimation } from './BurnAnimation';

export function GrinBurn() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokenMint, setTokenMint] = useState('');
  const [amount, setAmount] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [showBurnAnimation, setShowBurnAnimation] = useState(false);

  const handleBurn = async () => {
    if (!wallet.publicKey || !tokenMint) return;

    try {
      setIsBurning(true);
      
      // Validate mint address
      const mintPubkey = new PublicKey(tokenMint);
      
      // Burn tokens
      await burnTokens(connection, wallet, Number(amount));
      setShowBurnAnimation(true);
      
      // Close token account
      await closeTokenAccount(connection, wallet, mintPubkey);
      
      toast.success('Tokens burned successfully!');
      setTokenMint('');
      setAmount('');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 relative">
      <BurnAnimation 
        show={showBurnAnimation} 
        onComplete={() => setShowBurnAnimation(false)} 
      />
      
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold">GrinBurn</h2>
      </div>
      
      <p className="text-gray-400 mb-8">
        Burn your tokens and NFTs to receive SOL back from rent
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Mint Address
          </label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Enter token mint address"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Burn
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to burn"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleBurn}
          disabled={!wallet.connected || !tokenMint || !amount || isBurning}
          className="w-full px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isBurning ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Burning...
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              Burn Tokens
            </>
          )}
        </button>
      </div>
    </div>
  );
}