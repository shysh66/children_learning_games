// Rank definitions for the v6.0.0 themed progression system
// Ranks are based on unique_games_completed_count, NOT XP
// Each theme has 10 rank tiers (index 0-9)

export const RANKS = {
  space: [
    { title: "צוער חלל", icon: "🧑‍🚀" },
    { title: "אסטרונאוט", icon: "🚀" },
    { title: "טייס חללית", icon: "🛸" },
    { title: "מפקד משימה", icon: "👨‍✈️" },
    { title: "חוקר כוכבים", icon: "🔭" },
    { title: "קפטן גלקטי", icon: "🌌" },
    { title: "שומר הגלקסיה", icon: "🛡️" },
    { title: "אדמירל הכוכבים", icon: "🌟" },
    { title: "שליט הזמן", icon: "⏳" },
    { title: "האינסוף", icon: "♾️" },
  ],
  dino: [
    { title: "ביצה סדוקה", icon: "🥚" },
    { title: "דינוזאור בוקע", icon: "🐣" },
    { title: "צייד קטן", icon: "🐾" },
    { title: "ראפטור מהיר", icon: "🏃" },
    { title: "טריצרטופס חזק", icon: "🛡️" },
    { title: "מלך העמק", icon: "👑" },
    { title: "ענק קדמון", icon: "🌋" },
    { title: "טי-רקס אימתני", icon: "🦖" },
    { title: "הדרקון הקדום", icon: "🐲" },
    { title: "הטורף האולטימטיבי", icon: "🦴" },
  ],
  unicorn: [
    { title: "פוני קטן", icon: "🐴" },
    { title: "חבר קסום", icon: "🦄" },
    { title: "מהלך על קשת", icon: "🌈" },
    { title: "רוכב עננים", icon: "☁️" },
    { title: "שומר היער", icon: "🌲" },
    { title: "חד-קרן כסוף", icon: "✨" },
    { title: "חד-קרן מוזהב", icon: "🌟" },
    { title: "אגדת היער", icon: "🧚" },
    { title: "נסיך הכוכבים", icon: "🤴" },
    { title: "הקסם הטהור", icon: "💎" },
  ],
  knight: [
    { title: "נושא כלים", icon: "🎒" },
    { title: "שומר השער", icon: "🛡️" },
    { title: "קשת אמיץ", icon: "🏹" },
    { title: "פרש מלכותי", icon: "🐎" },
    { title: "אביר השולחן", icon: "⚔️" },
    { title: "אלוף החרב", icon: "🏆" },
    { title: "מפקד הצבא", icon: "🎖️" },
    { title: "גיבור אגדי", icon: "🦸" },
    { title: "שומר הממלכה", icon: "🏰" },
    { title: "המלך העליון", icon: "👑" },
  ],
  princess: [
    { title: "נסיכה מתחילה", icon: "🎀" },
    { title: "דוכסית", icon: "📜" },
    { title: "נסיכת הארמון", icon: "🏰" },
    { title: "מלכת הנשף", icon: "💃" },
    { title: "קוסמת הכתר", icon: "🪄" },
    { title: "שליטת הממלכה", icon: "👑" },
    { title: "מלכת היהלומים", icon: "💎" },
    { title: "קיסרית הקסם", icon: "✨" },
    { title: "מאסטרית הלבבות", icon: "❤️" },
    { title: "המלכה הנצחית", icon: "👸" },
  ],
};

// Thresholds: minimum unique games completed to reach each level (index 0-9)
export const LEVEL_THRESHOLDS = [0, 3, 7, 12, 18, 25, 35, 50, 70, 100];

// Get user level (0-9) based on unique games completed count
export const getUserLevel = (uniqueGamesCompleted) => {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (uniqueGamesCompleted >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};

// Get rank object for a theme and completed games count
// Returns { title, icon } or the first rank if theme not found
export const getRankForTheme = (themeId, uniqueGamesCompleted) => {
  const level = getUserLevel(uniqueGamesCompleted);
  const themeRanks = RANKS[themeId] || RANKS.space;
  return themeRanks[level];
};

// Get next rank for a theme (or null if at max)
export const getNextRankForTheme = (themeId, uniqueGamesCompleted) => {
  const level = getUserLevel(uniqueGamesCompleted);
  if (level >= 9) return null;
  const themeRanks = RANKS[themeId] || RANKS.space;
  return themeRanks[level + 1];
};

// Get next level threshold (games needed to reach next rank)
export const getNextLevelThreshold = (uniqueGamesCompleted) => {
  const level = getUserLevel(uniqueGamesCompleted);
  if (level >= 9) return null;
  return LEVEL_THRESHOLDS[level + 1];
};

// Get games remaining to next rank
export const getGamesToNextLevel = (uniqueGamesCompleted) => {
  const nextThreshold = getNextLevelThreshold(uniqueGamesCompleted);
  if (nextThreshold === null) return 0;
  return nextThreshold - uniqueGamesCompleted;
};

// Get progress percentage to next rank (0-100)
export const getProgressToNextLevel = (uniqueGamesCompleted) => {
  const level = getUserLevel(uniqueGamesCompleted);
  if (level >= 9) return 100;

  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = LEVEL_THRESHOLDS[level + 1];
  const progressInLevel = uniqueGamesCompleted - currentThreshold;
  const levelRange = nextThreshold - currentThreshold;

  return Math.min(100, Math.floor((progressInLevel / levelRange) * 100));
};

// ============ XP Functions (kept for display/fun metric) ============

// Calculate XP for a correct answer based on level
export const calculateAnswerXP = (levelIndex) => {
  return Math.floor(10 * (1 + (levelIndex * 0.5)));
};

// Calculate bonus XP for completing a level
export const calculateLevelBonusXP = (levelNumber) => {
  return 50 * levelNumber;
};

// ============ Legacy compatibility ============
// These are kept so old imports don't break during transition.
// They now work with the new themed system using 'space' as default.

export const ranks = Object.freeze(
  RANKS.space.map((r, i) => ({
    id: `level_${i}`,
    name: r.title,
    icon: r.icon,
    minXP: LEVEL_THRESHOLDS[i],
    maxXP: i < 9 ? LEVEL_THRESHOLDS[i + 1] - 1 : Infinity,
    color: 'from-indigo-400 to-indigo-600',
    textColor: 'text-indigo-400',
  }))
);

export const getRankByXP = (totalXP) => {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalXP >= ranks[i].minXP) {
      return ranks[i];
    }
  }
  return ranks[0];
};

export const getNextRank = (currentRank) => {
  const currentIndex = ranks.findIndex(r => r.id === currentRank.id);
  if (currentIndex < ranks.length - 1) {
    return ranks[currentIndex + 1];
  }
  return null;
};

export const getProgressToNextRank = (totalXP) => {
  const currentRank = getRankByXP(totalXP);
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 100;
  const xpInCurrentRank = totalXP - currentRank.minXP;
  const xpNeededForNextRank = nextRank.minXP - currentRank.minXP;
  return Math.min(100, Math.floor((xpInCurrentRank / xpNeededForNextRank) * 100));
};

export const getXPToNextRank = (totalXP) => {
  const currentRank = getRankByXP(totalXP);
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 0;
  return nextRank.minXP - totalXP;
};
