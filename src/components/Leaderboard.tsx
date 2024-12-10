import {
  useEffect,
  useState,
} from 'react';

import {
  getLeaderboard,
  LeaderboardEntry,
} from '../lib/supabase';

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await getLeaderboard();
        setEntries(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    // Update leaderboard periodically
    const subscription = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(subscription);
  }, []);

  if (loading) return <div className="text-white">Loading leaderboard...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <h2 className="text-xl text-white mb-4">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="p-2">Rank</th>
              <th className="p-2">Wallet</th>
              <th className="p-2">Wins</th>
              <th className="p-2">Current Streak</th>
              <th className="p-2">Longest Streak</th>
              <th className="p-2">Total Flips</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.wallet_address} className="text-white border-t border-gray-700">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  {entry.wallet_address.slice(0, 4)}...
                  {entry.wallet_address.slice(-4)}
                </td>
                <td className="p-2">{entry.total_wins}</td>
                <td className="p-2">
                  <span className={entry.current_streak > 0 ? 'text-green-400' : ''}>
                    {entry.current_streak}
                  </span>
                </td>
                <td className="p-2">{entry.longest_streak}</td>
                <td className="p-2">{entry.total_flips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
