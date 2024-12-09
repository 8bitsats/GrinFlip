import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Coins,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import {
  GameResult,
  ProvablyFair,
} from '../lib/provably-fair';
import { SoundManager } from '../lib/sounds';
import { useGameStore } from '../lib/store';
import {
  getGrinBalance,
  placeBet,
  processPayout,
} from '../lib/token';
import { CoinFlip } from './CoinFlip';
import { Logo } from './Logo';

export function Game() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected, signMessage } = wallet;
  const [error, setError] = useState<string | null>(null);
  const [grinBalance, setGrinBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [provablyFair, setProvablyFair] = useState<ProvablyFair | null>(null);
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);

  const { 
    soundEnabled, 
    toggleSound, 
    betAmount, 
    setBetAmount,
    isFlipping,
    setIsFlipping,
    selectedSide,
    setSelectedSide,
    recentFlips,
    addFlip
  } = useGameStore();

  useEffect(() => {
    SoundManager.init();
    setProvablyFair(new ProvablyFair(connection));
  }, [connection]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    async function updateBalance() {
      if (publicKey && connected) {
        setIsLoadingBalance(true);
        try {
          const balance = await getGrinBalance(publicKey.toString());
          setGrinBalance(balance);
        } catch (err) {
          console.error('Error fetching balance:', err);
          toast.error('Failed to fetch GRIN balance');
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setGrinBalance(0);
      }
    }
    
    updateBalance();
    const interval = setInterval(updateBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connected]);

  const generateClientSeed = useCallback(async () => {
    if (!signMessage) throw new Error('Wallet does not support message signing');
    
    const message = new TextEncoder().encode(`Grin Flip Game ${Date.now()}`);
    const signature = await signMessage(message);
    return Buffer.from(signature).toString('hex');
  }, [signMessage]);

  const handleFlip = async () => {
    try {
      if (!connected) {
        setError('Please connect your wallet first');
        return;
      }

      if (!selectedSide) {
        setError('Please select heads or tails first');
        return;
      }

      if (betAmount <= 0) {
        setError('Please enter a valid bet amount');
        return;
      }

      if (betAmount > grinBalance) {
        setError('Insufficient GRIN balance');
        return;
      }

      if (!provablyFair) {
        setError('Game system not initialized');
        return;
      }

      setIsProcessing(true);
      setIsFlipping(true);

      // Generate client seed and get game result
      const clientSeed = await generateClientSeed();
      const gameResult = await provablyFair.generateResult(clientSeed);
      setLastGameResult(gameResult);

      // Place bet
      await placeBet(connection, wallet, betAmount);
      
      const won = gameResult.result === selectedSide;

      // Process payout if won
      if (won) {
        await processPayout(connection, wallet, betAmount * 2);
      }

      setTimeout(() => {
        setIsFlipping(false);
        setIsProcessing(false);
        
        if (won) {
          SoundManager.playWin(soundEnabled);
          toast.success(`You won ${betAmount * 2} GRIN!`);
        } else {
          SoundManager.playLose(soundEnabled);
          toast.error(`You lost ${betAmount} GRIN`);
        }
        
        addFlip({
          user: publicKey?.toString().slice(0, 4) + '...' || 'Unknown',
          amount: betAmount,
          won,
          selectedSide,
          result: gameResult.result
        });
        
        setSelectedSide(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the transaction');
      setIsFlipping(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={toggleSound}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="h-6 w-6 text-purple-400" />
          ) : (
            <VolumeX className="h-6 w-6 text-purple-400" />
          )}
        </button>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition-colors" />
      </div>

      <Logo />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-green-400 animate-pulse">
          Grin Flip
        </h1>
        <p className="neon-text-green">Powered by $GRIN token on Solana</p>
      </div>

      {connected && (
        <div className="glass-panel rounded-xl p-4 mb-8 flex items-center justify-center gap-2">
          <Coins className="h-5 w-5 text-green-400" />
          <span className="text-lg">
            {isLoadingBalance ? (
              <span className="inline-block w-4 h-4 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
            ) : (
              <span>
                <span className="font-bold neon-text-purple">{grinBalance.toFixed(2)}</span>{' '}
                <span className="neon-text-green">GRIN</span>
              </span>
            )}
          </span>
        </div>
      )}

      <div className="glass-panel rounded-xl p-8 mb-8">
        <div className="mb-8">
          <CoinFlip 
            isFlipping={isFlipping} 
            result={selectedSide} 
            soundEnabled={soundEnabled}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSelectedSide('heads')}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-lg transition-all glow-button ${
                selectedSide === 'heads'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/10'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Heads
            </button>
            <button
              onClick={() => setSelectedSide('tails')}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-lg transition-all glow-button ${
                selectedSide === 'tails'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/10'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Tails
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min="0.1"
              step="0.1"
              disabled={isProcessing}
              className="w-32 px-4 py-2 rounded-lg bg-white/5 text-center disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="neon-text-green">GRIN</span>
          </div>

          <button
            onClick={handleFlip}
            disabled={!connected || isFlipping || !selectedSide || isProcessing}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 glow-button"
          >
            {isProcessing ? 'Processing...' : isFlipping ? 'Flipping...' : 'Flip Coin'}
          </button>

          {lastGameResult && (
            <div className="mt-4 text-sm text-gray-400">
              <p>Last Game Hash: <span className="text-purple-400">{lastGameResult.hash.slice(0, 10)}...</span></p>
              <p>Server Seed: <span className="text-green-400">{lastGameResult.serverSeed.slice(0, 10)}...</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 neon-text-purple">Recent Flips</h2>
        <div className="space-y-3">
          {recentFlips.map((flip, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-400">{flip.user}</span>
                <span className={flip.won ? 'neon-text-green' : 'text-red-400'}>
                  {flip.won ? 'Won' : 'Lost'} {flip.amount} GRIN
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {Math.floor((Date.now() - flip.timestamp) / 1000)}s ago
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}