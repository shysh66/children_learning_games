// LocalStorage utilities for persisting game progress
// Handles profiles, unlocked levels, stars earned, and XP tracking

const STORAGE_KEY = 'mathGameProgress';

// Available avatars for profile creation
export const AVATARS = ['🦁', '🦄', '🦖', '🚀', '🤖', '🐱', '🐶', '👑', '⚽', '🦋'];

// Generate unique ID for profiles
const generateId = () => `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default progress structure for a single profile
const getDefaultProfileProgress = () => ({
  junior: {
    unlockedLevel: 1,
    stars: {}, // { levelId: starsEarned }
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
  totalXP: 0, // Global XP for ranking system
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

  return {
    ...defaults,
    ...profile.progress,
    junior: { ...defaults.junior, ...profile.progress?.junior },
    multiply: { ...defaults.multiply, ...profile.progress?.multiply },
    divide: { ...defaults.divide, ...profile.progress?.divide },
    addsub: { ...defaults.addsub, ...profile.progress?.addsub },
    compare: { ...defaults.compare, ...profile.progress?.compare },
    sequence: { ...defaults.sequence, ...profile.progress?.sequence },
    totalXP: profile.progress?.totalXP || 0,
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
      stats: {
        categoryStats: mergedCategoryStats,
        dailyXP: savedStats.dailyXP || {},
      },
    };
  });
};
