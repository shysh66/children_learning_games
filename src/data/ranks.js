// Rank definitions for the XP economy system
// Ranks are based on totalXP stored in localStorage

export const ranks = [
  {
    id: 'bronze',
    name: 'ארד',
    icon: '🥉',
    minXP: 0,
    maxXP: 499,
    color: 'from-amber-600 to-amber-800',
    textColor: 'text-amber-600',
  },
  {
    id: 'silver',
    name: 'כסף',
    icon: '🥈',
    minXP: 500,
    maxXP: 1499,
    color: 'from-gray-300 to-gray-500',
    textColor: 'text-gray-400',
  },
  {
    id: 'gold',
    name: 'זהב',
    icon: '🥇',
    minXP: 1500,
    maxXP: 3499,
    color: 'from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-500',
  },
  {
    id: 'diamond',
    name: 'יהלום',
    icon: '💎',
    minXP: 3500,
    maxXP: 5999,
    color: 'from-cyan-300 to-cyan-500',
    textColor: 'text-cyan-400',
  },
  {
    id: 'champion',
    name: 'אלוף',
    icon: '🏆',
    minXP: 6000,
    maxXP: 11999,
    color: 'from-purple-400 to-purple-600',
    textColor: 'text-purple-400',
  },
  {
    id: 'legend',
    name: 'אגדה',
    icon: '👑',
    minXP: 12000,
    maxXP: Infinity,
    color: 'from-red-500 to-orange-500',
    textColor: 'text-red-400',
  },
];

// Get rank based on total XP
export const getRankByXP = (totalXP) => {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalXP >= ranks[i].minXP) {
      return ranks[i];
    }
  }
  return ranks[0]; // Default to bronze
};

// Get next rank (if exists)
export const getNextRank = (currentRank) => {
  const currentIndex = ranks.findIndex(r => r.id === currentRank.id);
  if (currentIndex < ranks.length - 1) {
    return ranks[currentIndex + 1];
  }
  return null; // Already at max rank
};

// Calculate progress to next rank (0-100%)
export const getProgressToNextRank = (totalXP) => {
  const currentRank = getRankByXP(totalXP);
  const nextRank = getNextRank(currentRank);

  if (!nextRank) {
    return 100; // Already at max rank
  }

  const xpInCurrentRank = totalXP - currentRank.minXP;
  const xpNeededForNextRank = nextRank.minXP - currentRank.minXP;

  return Math.min(100, Math.floor((xpInCurrentRank / xpNeededForNextRank) * 100));
};

// Get XP needed for next rank
export const getXPToNextRank = (totalXP) => {
  const currentRank = getRankByXP(totalXP);
  const nextRank = getNextRank(currentRank);

  if (!nextRank) {
    return 0; // Already at max rank
  }

  return nextRank.minXP - totalXP;
};

// Calculate XP for a correct answer based on level
export const calculateAnswerXP = (levelIndex) => {
  // Level 1 = 10 XP, Level 2 = 15 XP, Level 3 = 20 XP, Level 4 = 25 XP, etc.
  return Math.floor(10 * (1 + (levelIndex * 0.5)));
};

// Calculate bonus XP for completing a level
export const calculateLevelBonusXP = (levelNumber) => {
  // Level 1 = 50 XP, Level 2 = 100 XP, Level 3 = 150 XP, Level 4 = 200 XP
  return 50 * levelNumber;
};
