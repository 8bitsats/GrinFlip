import { create } from 'zustand';

interface LocalFlipRecord {
  user: string;
  amount: number;
  won: boolean;
  selectedSide: 'heads' | 'tails';
  result: 'heads' | 'tails';
  timestamp: number;
}

interface GameState {
  soundEnabled: boolean;
  toggleSound: () => void;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  isFlipping: boolean;
  setIsFlipping: (flipping: boolean) => void;
  selectedSide: 'heads' | 'tails' | null;
  setSelectedSide: (side: 'heads' | 'tails' | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  recentFlips: LocalFlipRecord[];
  addFlip: (flip: Omit<LocalFlipRecord, 'timestamp'>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  betAmount: 1,
  setBetAmount: (amount) => set({ betAmount: Math.floor(amount) }),
  isFlipping: false,
  setIsFlipping: (flipping) => set({ isFlipping: flipping }),
  selectedSide: null,
  setSelectedSide: (side) => set({ selectedSide: side }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  recentFlips: [],
  addFlip: (flip) =>
    set((state) => ({
      recentFlips: [
        {
          ...flip,
          timestamp: Date.now(),
        },
        ...state.recentFlips,
      ].slice(0, 10),
    })),
}));
