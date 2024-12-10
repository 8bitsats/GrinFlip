import {
  useEffect,
  useState,
} from 'react';

import {
  FlipRecord,
  getRecentFlips,
} from '../lib/supabase';

export const RecentFlips = () => {
  const [flips, setFlips] = useState<FlipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlips = async () => {
      try {
        const recentFlips = await getRecentFlips();
        setFlips(recentFlips);
      } catch (error) {
        console.error('Error fetching recent flips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlips();
    // Set up real-time subscription
    const subscription = setInterval(fetchFlips, 5000);
    return () => clearInterval(subscription);
  }, []);

  if (loading) return <div className="text-white">Loading recent flips...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <h2 className="text-xl text-white mb-4">Recent Flips</h2>
      <div className="space-y-2">
        {flips.map((flip) => (
          <div
            key={flip.id}
            className={`flex justify-between items-center p-2 rounded ${
              flip.won ? 'bg-green-900' : 'bg-red-900'
            }`}
          >
            <div className="text-white">
              {flip.wallet_address.slice(0, 4)}...
              {flip.wallet_address.slice(-4)}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">{flip.result}</span>
              <span className="text-white">{flip.amount} GRIN</span>
              <span className={flip.won ? 'text-green-400' : 'text-red-400'}>
                {flip.won ? 'Won' : 'Lost'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
