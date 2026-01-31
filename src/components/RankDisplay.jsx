import React from 'react';
import { getRankByXP, getNextRank, getProgressToNextRank, getXPToNextRank } from '../data/ranks';

// Compact rank badge for headers
export const RankBadge = ({ totalXP, size = 'medium' }) => {
  const rank = getRankByXP(totalXP);

  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={sizeClasses[size]}>{rank.icon}</span>
      <span className={`font-bold text-white ${size === 'small' ? 'text-lg' : 'text-xl'}`}>
        {rank.name}
      </span>
    </div>
  );
};

// Full rank display with progress bar
const RankDisplay = ({ totalXP, showProgress = true, compact = false }) => {
  const rank = getRankByXP(totalXP);
  const nextRank = getNextRank(rank);
  const progress = getProgressToNextRank(totalXP);
  const xpToNext = getXPToNextRank(totalXP);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2">
        <span className="text-3xl">{rank.icon}</span>
        <div>
          <div className="text-white font-bold">{rank.name}</div>
          <div className="text-white/70 text-sm">{totalXP.toLocaleString()} XP</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
      {/* Current Rank */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="text-6xl animate-pulse">{rank.icon}</span>
        <div className="text-center">
          <div className="text-3xl font-black text-white">{rank.name}</div>
          <div className="text-xl text-white/80">{totalXP.toLocaleString()} XP</div>
        </div>
      </div>

      {/* Progress to next rank */}
      {showProgress && nextRank && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm">לדרגה הבאה:</span>
            <span className="text-white font-bold flex items-center gap-1">
              {nextRank.icon} {nextRank.name}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${nextRank.color} transition-all duration-500 rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center mt-2 text-white/70 text-sm">
            עוד {xpToNext.toLocaleString()} XP
          </div>
        </div>
      )}

      {/* Max rank message */}
      {showProgress && !nextRank && (
        <div className="text-center mt-4 text-yellow-300 font-bold">
          הגעת לדרגה הגבוהה ביותר!
        </div>
      )}
    </div>
  );
};

export default RankDisplay;
