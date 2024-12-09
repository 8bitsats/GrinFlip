import { useGameStore } from '../lib/store';

export function Scoreboard() {
  const { recentFlips } = useGameStore();
  
  const stats = recentFlips.reduce((acc, flip) => {
    acc.total++;
    if (flip.won) acc.wins++;
    acc[flip.selectedSide]++;
    return acc;
  }, {
    total: 0,
    wins: 0,
    heads: 0,
    tails: 0
  });

  const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;
  const headsRate = stats.total > 0 ? ((stats.heads / stats.total) * 100).toFixed(1) : 0;
  const tailsRate = stats.total > 0 ? ((stats.tails / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
      <div className="bg-purple-500/10 rounded-lg p-4">
        <div className="text-2xl font-bold text-purple-400">{winRate}%</div>
        <div className="text-sm text-gray-400">Win Rate</div>
      </div>
      <div className="bg-purple-500/10 rounded-lg p-4">
        <div className="text-2xl font-bold text-purple-400">{headsRate}%</div>
        <div className="text-sm text-gray-400">Heads Rate</div>
      </div>
      <div className="bg-purple-500/10 rounded-lg p-4">
        <div className="text-2xl font-bold text-purple-400">{tailsRate}%</div>
        <div className="text-sm text-gray-400">Tails Rate</div>
      </div>
    </div>
  );
}