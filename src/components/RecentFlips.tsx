import { User } from 'lucide-react';

interface Flip {
  user: string;
  amount: number;
  times: number;
  timestamp: number;
}

interface RecentFlipsProps {
  flips: Flip[];
}

export function RecentFlips({ flips }: RecentFlipsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Plays</h2>
      <ul>
        {flips.map((flip, index) => (
          <li key={index} className="flex items-center justify-between mb-2 py-2 border-b border-gray-700">
            <div className="flex items-center">
              <User className="mr-2 h-6 w-6 bg-gray-600 rounded-full p-1" />
              <span>{flip.user} flipped {flip.amount} and doubled {flip.times} times.</span>
            </div>
            <span className="text-gray-400">
              {Math.floor((Date.now() - flip.timestamp) / 1000)} seconds ago
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}