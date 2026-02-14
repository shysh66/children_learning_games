// Subject Medal System (v6.0.0)
// Medals are earned per subject based on unique games completed and average score
//
// Medal tiers:
//   Bronze  🥉 : 5 unique games completed in subject
//   Silver  🥈 : 15 unique games + avg score > 80%
//   Gold    🥇 : 30 unique games + avg score > 90%
//   Diamond 💎 : 100% completion of ALL available games in subject

export const MEDAL_TIERS = {
  bronze: { id: 'bronze', name: 'ארד', icon: '🥉', minGames: 5, minAvg: 0 },
  silver: { id: 'silver', name: 'כסף', icon: '🥈', minGames: 15, minAvg: 80 },
  gold: { id: 'gold', name: 'זהב', icon: '🥇', minGames: 30, minAvg: 90 },
  diamond: { id: 'diamond', name: 'יהלום', icon: '💎' },
};

// Total available games per subject (based on level counts in levelConfigs.js)
export const SUBJECT_TOTAL_GAMES = {
  multiply: 5,
  divide: 4,
  addsub: 8,
  junior: 8,
  compare: 5,
  sequence: 5,
};

// Subject display names (Hebrew)
export const SUBJECT_NAMES = {
  multiply: 'כפל',
  divide: 'חילוק',
  addsub: 'חיבור וחיסור',
  junior: 'חשבון ראשוני',
  compare: 'השוואה',
  sequence: 'סדרות',
};

// Calculate medal tier for a single subject
// subjectStats: { completedGameIds: string[], totalCorrect: number, totalAttempts: number }
// totalAvailable: total number of games available in this subject
// Returns: 'diamond' | 'gold' | 'silver' | 'bronze' | null
export const getSubjectMedal = (subjectStats, totalAvailable) => {
  if (!subjectStats) return null;

  const uniqueGames = (subjectStats.completedGameIds || []).length;
  const avgScore = subjectStats.totalAttempts > 0
    ? (subjectStats.totalCorrect / subjectStats.totalAttempts) * 100
    : 0;

  // Diamond: 100% completion of all available games in subject
  if (totalAvailable > 0 && uniqueGames >= totalAvailable) {
    return 'diamond';
  }

  // Gold: 30+ unique games AND avg > 90%
  if (uniqueGames >= MEDAL_TIERS.gold.minGames && avgScore > MEDAL_TIERS.gold.minAvg) {
    return 'gold';
  }

  // Silver: 15+ unique games AND avg > 80%
  if (uniqueGames >= MEDAL_TIERS.silver.minGames && avgScore > MEDAL_TIERS.silver.minAvg) {
    return 'silver';
  }

  // Bronze: 5+ unique games
  if (uniqueGames >= MEDAL_TIERS.bronze.minGames) {
    return 'bronze';
  }

  return null;
};

// Calculate medals for all subjects
// subjectStats: { [gameMode]: { completedGameIds, totalCorrect, totalAttempts } }
// Returns: { [gameMode]: 'diamond' | 'gold' | 'silver' | 'bronze' | null }
export const getAllSubjectMedals = (subjectStats) => {
  const medals = {};
  for (const [subject, totalGames] of Object.entries(SUBJECT_TOTAL_GAMES)) {
    medals[subject] = getSubjectMedal(subjectStats?.[subject], totalGames);
  }
  return medals;
};

// Get medal display info
// Returns { icon, name } or null
export const getMedalDisplay = (medalTier) => {
  if (!medalTier || !MEDAL_TIERS[medalTier]) return null;
  const tier = MEDAL_TIERS[medalTier];
  return { icon: tier.icon, name: tier.name };
};

// Check if a new medal was earned (compare old and new medal for a subject)
// Returns the new medal tier if upgraded, or null if no change
export const checkMedalUpgrade = (oldMedal, newMedal) => {
  if (!newMedal) return null;
  if (oldMedal === newMedal) return null;

  const tierOrder = [null, 'bronze', 'silver', 'gold', 'diamond'];
  const oldIndex = tierOrder.indexOf(oldMedal);
  const newIndex = tierOrder.indexOf(newMedal);

  if (newIndex > oldIndex) return newMedal;
  return null;
};
