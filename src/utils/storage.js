// LocalStorage utilities for persisting game progress
// Handles profiles, unlocked levels, stars earned, XP tracking,
// and v6.0.0 subject stats / rank system

import { getAllSubjectMedals, getSubjectMedal, SUBJECT_TOTAL_GAMES, checkMedalUpgrade } from '../data/medals';
import { getUserLevel } from '../data/ranks';

const STORAGE_KEY = 'mathGameProgress';
export const CURRENT_VERSION = '6.0.0';

// Available avatars for profile creation
export const AVATARS = ['🦁', '🦄', '🦖', '🚀', '🤖', '🐱', '🐶', '👑', '⚽', '🦋'];

// Generate unique ID for profiles
const generateId = () => `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default subject stats structure
const getDefaultSubjectStats = () => ({
  multiply: { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 },
  divide: { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 },
  addsub: { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 },
  junior: { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 },
  compare: { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 },
  sequence: { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 },
});

// Default progress structure for a single profile
const getDefaultProfileProgress = () => ({
  version: CURRENT_VERSION,
  junior: {
    unlockedLevel: 1,
    stars: {},
  },
  multiply: {
    unlockedLevel: 1,
    stars: {},
  },
  divide: {
    unlockedLevel: 1,
    stars: {},
  },
  addsub: {
    unlockedLevel: 1,
    stars: {},
  },
  compare: {
    unlockedLevel: 1,
    stars: {},
  },
  sequence: {
    unlockedLevel: 1,
    stars: {},
  },
  selectedTheme: null,
  totalXP: 0,
  // Sticker Album system (Little Explorers)
  stickerAlbumStars: 0,
  stickers: [],
  completedGameIds: [],
  // v6.0.0: Per-subject stats for medal system
  subjectStats: getDefaultSubjectStats(),
  // v6.0.0: Stored medals per subject
  medals: {},
  stats: {
    categoryStats: {
      junior: { attempts: 0, correct: 0 },
      multiply: { attempts: 0, correct: 0 },
      divide: { attempts: 0, correct: 0 },
      addsub: { attempts: 0, correct: 0 },
      compare: { attempts: 0, correct: 0 },
      sequence: { attempts: 0, correct: 0 },
      english: { attempts: 0, correct: 0 },
      sorter: { attempts: 0, correct: 0 },
      smartMemory: { attempts: 0, correct: 0 },
    },
    dailyXP: {},
  },
});

// Default data structure with profiles
const getDefaultData = () => ({
  profiles: [],
  activeProfileId: null,
});

// Check if data is in old format (no profiles array)
const isOldFormat = (data) => {
  return data && !data.profiles && (data.junior || data.multiply || data.addsub || data.totalXP !== undefined);
};

// Migrate old data to new profile format
const migrateOldData = (oldData) => {
  const defaultProfile = {
    id: generateId(),
    name: 'שחקן ראשי',
    avatar: '🦁',
    createdAt: Date.now(),
    progress: {
      junior: oldData.junior || getDefaultProfileProgress().junior,
      multiply: oldData.multiply || getDefaultProfileProgress().multiply,
      divide: oldData.divide || getDefaultProfileProgress().divide,
      addsub: oldData.addsub || getDefaultProfileProgress().addsub,
      selectedTheme: oldData.selectedTheme || null,
      totalXP: oldData.totalXP || 0,
    },
  };

  return {
    profiles: [defaultProfile],
    activeProfileId: defaultProfile.id,
  };
};

// ============ v6.0.0 Migration ============

// Check if a profile needs v6 migration
export const needsV6Migration = (profile) => {
  if (!profile) return false;
  return profile.progress?.version !== CURRENT_VERSION;
};

// Migrate a profile to v6.0.0
// Keeps: name, avatar, selectedTheme, createdAt
// Resets: xp, completedGameIds, medals, subjectStats
// Preserves: level progression (stars & unlocked levels) and sticker album
const migrateProfileToV6 = (profile) => {
  const defaults = getDefaultProfileProgress();
  return {
    ...profile,
    progress: {
      ...defaults,
      // Keep existing level progression (stars and unlocked levels)
      junior: profile.progress?.junior || defaults.junior,
      multiply: profile.progress?.multiply || defaults.multiply,
      divide: profile.progress?.divide || defaults.divide,
      addsub: profile.progress?.addsub || defaults.addsub,
      compare: profile.progress?.compare || defaults.compare,
      sequence: profile.progress?.sequence || defaults.sequence,
      // Keep user preferences
      selectedTheme: profile.progress?.selectedTheme || null,
      selectedZone: profile.progress?.selectedZone || null,
      // Keep sticker album
      stickerAlbumStars: profile.progress?.stickerAlbumStars || 0,
      stickers: profile.progress?.stickers || [],
      // RESET for v6.0.0
      version: CURRENT_VERSION,
      totalXP: 0,
      completedGameIds: [],
      subjectStats: getDefaultSubjectStats(),
      medals: {},
      stats: defaults.stats,
    },
  };
};

// Check and migrate all profiles. Returns true if any migration occurred.
export const checkAndMigrateProfiles = () => {
  const data = loadRawData();
  let migrated = false;

  if (data.profiles) {
    data.profiles = data.profiles.map((profile) => {
      if (needsV6Migration(profile)) {
        migrated = true;
        return migrateProfileToV6(profile);
      }
      return profile;
    });
  }

  if (migrated) {
    saveRawData(data);
  }

  return migrated;
};

// Load raw data from localStorage
const loadRawData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Check for old format and migrate
      if (isOldFormat(parsed)) {
        console.log('Migrating old data format to profiles...');
        const migrated = migrateOldData(parsed);
        saveRawData(migrated);
        return migrated;
      }

      return parsed;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return getDefaultData();
};

// Save raw data to localStorage
const saveRawData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// ============ Profile Management ============

// Get all profiles
export const getProfiles = () => {
  const data = loadRawData();
  return data.profiles || [];
};

// Get active profile
export const getActiveProfile = () => {
  const data = loadRawData();
  if (!data.activeProfileId || !data.profiles) return null;
  return data.profiles.find(p => p.id === data.activeProfileId) || null;
};

// Get active profile ID
export const getActiveProfileId = () => {
  const data = loadRawData();
  return data.activeProfileId;
};

// Set active profile
export const setActiveProfile = (profileId) => {
  const data = loadRawData();
  if (data.profiles.some(p => p.id === profileId)) {
    data.activeProfileId = profileId;
    saveRawData(data);
    return true;
  }
  return false;
};

// Create new profile
export const createProfile = (name, avatar) => {
  const data = loadRawData();
  const newProfile = {
    id: generateId(),
    name: name.trim() || 'שחקן',
    avatar: avatar || '🦁',
    createdAt: Date.now(),
    progress: getDefaultProfileProgress(),
  };

  data.profiles.push(newProfile);
  data.activeProfileId = newProfile.id;
  saveRawData(data);

  return newProfile;
};

// Delete profile
export const deleteProfile = (profileId) => {
  const data = loadRawData();
  data.profiles = data.profiles.filter(p => p.id !== profileId);

  // If deleted profile was active, clear active or set to first available
  if (data.activeProfileId === profileId) {
    data.activeProfileId = data.profiles.length > 0 ? data.profiles[0].id : null;
  }

  saveRawData(data);
};

// Log out (clear active profile)
export const logoutProfile = () => {
  const data = loadRawData();
  data.activeProfileId = null;
  saveRawData(data);
};

// ============ Progress Functions (use active profile) ============

// Load progress for active profile
export const loadProgress = () => {
  const profile = getActiveProfile();
  if (!profile) {
    return getDefaultProfileProgress();
  }

  // Merge with defaults to handle new fields
  const defaults = getDefaultProfileProgress();
  const defaultCategoryStats = defaults.stats.categoryStats;
  const savedCategoryStats = profile.progress?.stats?.categoryStats || {};

  // Deep merge each category's stats
  const mergedCategoryStats = {};
  for (const key of Object.keys(defaultCategoryStats)) {
    mergedCategoryStats[key] = {
      ...defaultCategoryStats[key],
      ...savedCategoryStats[key],
    };
  }

  // Deep merge subject stats
  const defaultSubjectStats = getDefaultSubjectStats();
  const savedSubjectStats = profile.progress?.subjectStats || {};
  const mergedSubjectStats = {};
  for (const key of Object.keys(defaultSubjectStats)) {
    mergedSubjectStats[key] = {
      ...defaultSubjectStats[key],
      ...savedSubjectStats[key],
    };
  }

  return {
    ...defaults,
    ...profile.progress,
    version: profile.progress?.version || CURRENT_VERSION,
    junior: { ...defaults.junior, ...profile.progress?.junior },
    multiply: { ...defaults.multiply, ...profile.progress?.multiply },
    divide: { ...defaults.divide, ...profile.progress?.divide },
    addsub: { ...defaults.addsub, ...profile.progress?.addsub },
    compare: { ...defaults.compare, ...profile.progress?.compare },
    sequence: { ...defaults.sequence, ...profile.progress?.sequence },
    totalXP: profile.progress?.totalXP || 0,
    stickerAlbumStars: profile.progress?.stickerAlbumStars || 0,
    stickers: profile.progress?.stickers || [],
    completedGameIds: profile.progress?.completedGameIds || [],
    subjectStats: mergedSubjectStats,
    medals: profile.progress?.medals || {},
    stats: {
      categoryStats: mergedCategoryStats,
      dailyXP: { ...profile.progress?.stats?.dailyXP },
    },
  };
};

// Save progress for active profile
export const saveProgress = (progress) => {
  const data = loadRawData();
  const profileIndex = data.profiles.findIndex(p => p.id === data.activeProfileId);

  if (profileIndex === -1) {
    console.error('No active profile to save progress');
    return;
  }

  data.profiles[profileIndex].progress = progress;
  saveRawData(data);
};

// Update stars for a specific level
export const updateLevelStars = (gameMode, levelId, newStars) => {
  const progress = loadProgress();
  const currentStars = progress[gameMode].stars[levelId] || 0;

  // Only update if new stars are better
  if (newStars > currentStars) {
    progress[gameMode].stars[levelId] = newStars;

    // Unlock next level if earned at least 1 star
    if (newStars >= 1 && levelId >= progress[gameMode].unlockedLevel) {
      progress[gameMode].unlockedLevel = levelId + 1;
    }

    saveProgress(progress);
  }

  return progress;
};

// Get stars for a specific level
export const getLevelStars = (gameMode, levelId) => {
  const progress = loadProgress();
  return progress[gameMode]?.stars[levelId] || 0;
};

// Check if a level is unlocked
export const isLevelUnlocked = (gameMode, levelId) => {
  const progress = loadProgress();
  return levelId <= progress[gameMode].unlockedLevel;
};

// Get highest unlocked level for a game mode
export const getUnlockedLevel = (gameMode) => {
  const progress = loadProgress();
  return progress[gameMode].unlockedLevel;
};

// Save selected theme
export const saveTheme = (themeId) => {
  const progress = loadProgress();
  progress.selectedTheme = themeId;
  saveProgress(progress);
};

// Get selected theme
export const getSelectedTheme = () => {
  const progress = loadProgress();
  return progress.selectedTheme;
};

// Save selected zone (littleExplorers or aceAcademy)
export const saveSelectedZone = (zone) => {
  const progress = loadProgress();
  progress.selectedZone = zone;
  saveProgress(progress);
};

// Get selected zone
export const getSelectedZone = () => {
  const progress = loadProgress();
  return progress.selectedZone || null;
};

// Reset all progress for active profile
export const resetProgress = () => {
  saveProgress(getDefaultProfileProgress());
};

// Get total XP
export const getTotalXP = () => {
  const progress = loadProgress();
  return progress.totalXP || 0;
};

// Add XP to total (also tracks daily XP)
export const addXP = (amount) => {
  const progress = loadProgress();
  const previousXP = progress.totalXP || 0;
  progress.totalXP = previousXP + amount;

  // Track daily XP
  if (!progress.stats) progress.stats = getDefaultProfileProgress().stats;
  if (!progress.stats.dailyXP) progress.stats.dailyXP = {};
  const today = new Date().toISOString().split('T')[0];
  progress.stats.dailyXP[today] = (progress.stats.dailyXP[today] || 0) + amount;

  saveProgress(progress);
  return {
    previousXP,
    newXP: progress.totalXP,
    added: amount,
  };
};

// Set total XP (use sparingly, prefer addXP)
export const setTotalXP = (amount) => {
  const progress = loadProgress();
  progress.totalXP = amount;
  saveProgress(progress);
};

// Check if any profiles exist
export const hasProfiles = () => {
  const profiles = getProfiles();
  return profiles.length > 0;
};

// Check if there's an active logged-in profile
export const hasActiveProfile = () => {
  return getActiveProfile() !== null;
};

// Record game stats (attempts + correct answers) for a category
export const recordGameStats = (gameMode, attempts, correct) => {
  const progress = loadProgress();
  if (!progress.stats) progress.stats = getDefaultProfileProgress().stats;
  if (!progress.stats.categoryStats) progress.stats.categoryStats = {};
  if (!progress.stats.categoryStats[gameMode]) {
    progress.stats.categoryStats[gameMode] = { attempts: 0, correct: 0 };
  }
  progress.stats.categoryStats[gameMode].attempts += attempts;
  progress.stats.categoryStats[gameMode].correct += correct;
  saveProgress(progress);
};

// Get stats for a specific profile by ID (for parent dashboard)
export const getProfileById = (profileId) => {
  const data = loadRawData();
  return data.profiles.find(p => p.id === profileId) || null;
};

// Get all profiles with their stats (for parent dashboard)
export const getAllProfilesWithStats = () => {
  const data = loadRawData();
  const defaults = getDefaultProfileProgress();

  return (data.profiles || []).map(profile => {
    const savedStats = profile.progress?.stats || {};
    const savedCategoryStats = savedStats.categoryStats || {};

    const mergedCategoryStats = {};
    for (const key of Object.keys(defaults.stats.categoryStats)) {
      mergedCategoryStats[key] = {
        ...defaults.stats.categoryStats[key],
        ...savedCategoryStats[key],
      };
    }

    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      totalXP: profile.progress?.totalXP || 0,
      completedGameIds: profile.progress?.completedGameIds || [],
      subjectStats: profile.progress?.subjectStats || getDefaultSubjectStats(),
      medals: profile.progress?.medals || {},
      selectedTheme: profile.progress?.selectedTheme || null,
      stats: {
        categoryStats: mergedCategoryStats,
        dailyXP: savedStats.dailyXP || {},
      },
    };
  });
};

// ============ v6.0.0 Game Completion (Anti-Farming) ============

// Check if a specific game has been completed before
export const isGameCompleted = (gameId) => {
  const progress = loadProgress();
  return (progress.completedGameIds || []).includes(gameId);
};

// Get total unique games completed
export const getUniqueGamesCount = () => {
  const progress = loadProgress();
  return (progress.completedGameIds || []).length;
};

// Complete a game (one-time count rule)
// Returns: { isNewGame, totalUniqueGames, previousLevel, newLevel, medalUpgrade, subjectMedal }
export const completeGame = (gameMode, level, score, totalQuestions) => {
  const progress = loadProgress();
  const gameId = `${gameMode}-level-${level}`;
  const completedGameIds = progress.completedGameIds || [];

  // Anti-farming: check if already completed
  if (completedGameIds.includes(gameId)) {
    return {
      isNewGame: false,
      totalUniqueGames: completedGameIds.length,
      previousLevel: getUserLevel(completedGameIds.length),
      newLevel: getUserLevel(completedGameIds.length),
      medalUpgrade: null,
      subjectMedal: progress.medals?.[gameMode] || null,
    };
  }

  // NEW game completion
  const previousCount = completedGameIds.length;
  const previousLevel = getUserLevel(previousCount);

  // Add to global completed list
  progress.completedGameIds = [...completedGameIds, gameId];

  // Update per-subject stats
  if (!progress.subjectStats) progress.subjectStats = getDefaultSubjectStats();
  if (!progress.subjectStats[gameMode]) {
    progress.subjectStats[gameMode] = { completedGameIds: [], totalCorrect: 0, totalAttempts: 0 };
  }
  progress.subjectStats[gameMode].completedGameIds = [
    ...(progress.subjectStats[gameMode].completedGameIds || []),
    gameId,
  ];
  progress.subjectStats[gameMode].totalCorrect += score;
  progress.subjectStats[gameMode].totalAttempts += totalQuestions;

  // Calculate new level
  const newCount = progress.completedGameIds.length;
  const newLevel = getUserLevel(newCount);

  // Calculate medal for this subject
  const oldMedal = progress.medals?.[gameMode] || null;
  const totalAvailable = SUBJECT_TOTAL_GAMES[gameMode] || 0;
  const newMedal = getSubjectMedal(progress.subjectStats[gameMode], totalAvailable);

  // Store updated medal
  if (!progress.medals) progress.medals = {};
  if (newMedal) {
    progress.medals[gameMode] = newMedal;
  }

  const medalUpgrade = checkMedalUpgrade(oldMedal, newMedal);

  saveProgress(progress);

  return {
    isNewGame: true,
    totalUniqueGames: newCount,
    previousLevel,
    newLevel,
    medalUpgrade,
    subjectMedal: newMedal,
  };
};

// Get all medals for the active profile
export const getProfileMedals = () => {
  const progress = loadProgress();
  return getAllSubjectMedals(progress.subjectStats || {});
};

// ============ Sticker Album Functions ============

// Grant a star for completing a game (one-time per gameId)
// Returns { earned: boolean, totalStars: number }
export const grantStar = (gameId) => {
  const progress = loadProgress();
  const completedGameIds = progress.completedGameIds || [];

  // Already completed this game — no farming
  if (completedGameIds.includes(gameId)) {
    return { earned: false, totalStars: progress.stickerAlbumStars || 0 };
  }

  // New completion: grant a star
  progress.completedGameIds = [...completedGameIds, gameId];
  progress.stickerAlbumStars = (progress.stickerAlbumStars || 0) + 1;
  saveProgress(progress);

  return { earned: true, totalStars: progress.stickerAlbumStars };
};

// Get sticker album data for the active profile
export const getAlbumData = () => {
  const progress = loadProgress();
  return {
    stars: progress.stickerAlbumStars || 0,
    stickers: progress.stickers || [],
    completedGameIds: progress.completedGameIds || [],
  };
};

// Purchase a sticker with a star
// Returns { success: boolean, stickers: string[] }
export const purchaseSticker = (stickerId) => {
  const progress = loadProgress();
  const stars = progress.stickerAlbumStars || 0;
  const stickers = progress.stickers || [];

  if (stars <= 0 || stickers.includes(stickerId)) {
    return { success: false, stickers };
  }

  progress.stickerAlbumStars = stars - 1;
  progress.stickers = [...stickers, stickerId];
  saveProgress(progress);

  return { success: true, stickers: progress.stickers };
};
