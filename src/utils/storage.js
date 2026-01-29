// LocalStorage utilities for persisting game progress
// Handles unlocked levels and stars earned per level

const STORAGE_KEY = 'mathGameProgress';

// Default progress structure
const getDefaultProgress = () => ({
  junior: {
    unlockedLevel: 1,
    stars: {}, // { levelId: starsEarned }
  },
  multiply: {
    unlockedLevel: 1,
    stars: {},
  },
  addsub: {
    unlockedLevel: 1,
    stars: {},
  },
  selectedTheme: null,
});

// Load progress from localStorage
export const loadProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return {
        ...getDefaultProgress(),
        ...parsed,
        junior: { ...getDefaultProgress().junior, ...parsed.junior },
        multiply: { ...getDefaultProgress().multiply, ...parsed.multiply },
        addsub: { ...getDefaultProgress().addsub, ...parsed.addsub },
      };
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return getDefaultProgress();
};

// Save progress to localStorage
export const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
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

// Reset all progress (for testing/debug)
export const resetProgress = () => {
  saveProgress(getDefaultProgress());
};
