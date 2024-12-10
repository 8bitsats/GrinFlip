import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FlipRecord {
  id: number;
  wallet_address: string;
  result: 'heads' | 'tails';
  amount: number;
  won: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  wallet_address: string;
  total_wins: number;
  longest_streak: number;
  current_streak: number;
  total_flips: number;
}

export const getRecentFlips = async (limit = 10) => {
  const { data, error } = await supabase
    .from('flips')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as FlipRecord[];
};

export const getLeaderboard = async (limit = 10) => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_wins', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as LeaderboardEntry[];
};

export const recordFlip = async (
  walletAddress: string,
  result: 'heads' | 'tails',
  amount: number,
  won: boolean
) => {
  const { error: flipError } = await supabase.from('flips').insert([
    {
      wallet_address: walletAddress,
      result,
      amount,
      won,
    },
  ]);

  if (flipError) throw flipError;

  // Update leaderboard
  const { data: existingEntry } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existingEntry) {
    const newStreak = won ? existingEntry.current_streak + 1 : 0;
    const newLongestStreak = Math.max(existingEntry.longest_streak, newStreak);

    await supabase
      .from('leaderboard')
      .update({
        total_wins: existingEntry.total_wins + (won ? 1 : 0),
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        total_flips: existingEntry.total_flips + 1,
      })
      .eq('wallet_address', walletAddress);
  } else {
    await supabase.from('leaderboard').insert([
      {
        wallet_address: walletAddress,
        total_wins: won ? 1 : 0,
        current_streak: won ? 1 : 0,
        longest_streak: won ? 1 : 0,
        total_flips: 1,
      },
    ]);
  }
};
