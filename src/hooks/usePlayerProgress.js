import { useState, useEffect, useCallback } from 'react';

const getDefaultProgress = () => ({
  young_explorers: { unlocked_levels: [1], level_scores: {}, weak_words: [] },
  class_champions: { unlocked_levels: [1], level_scores: {}, weak_words: [] },
});

const usePlayerProgress = (playerName, gameArea) => {
  const storageKey = `english_progress_${playerName}`;

  const [progressData, setProgressData] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading player progress:', error);
    }
    return getDefaultProgress();
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving player progress:', error);
    }
  }, [progressData, storageKey]);

  const completeLevel = useCallback((levelId, score) => {
    setProgressData((prev) => {
      const area = prev[gameArea];
      const currentScore = area.level_scores[levelId] || 0;

      if (score <= currentScore) {
        return prev;
      }

      const nextLevel = levelId + 1;
      const unlockedLevels = area.unlocked_levels.includes(nextLevel)
        ? area.unlocked_levels
        : [...area.unlocked_levels, nextLevel];

      return {
        ...prev,
        [gameArea]: {
          ...area,
          level_scores: { ...area.level_scores, [levelId]: score },
          unlocked_levels: unlockedLevels,
        },
      };
    });
  }, [gameArea]);

  const markWordAsWeak = useCallback((wordId) => {
    setProgressData((prev) => {
      const area = prev[gameArea];

      if (area.weak_words.includes(wordId)) {
        return prev;
      }

      return {
        ...prev,
        [gameArea]: {
          ...area,
          weak_words: [...area.weak_words, wordId],
        },
      };
    });
  }, [gameArea]);

  const getProgress = useCallback(() => {
    return progressData[gameArea];
  }, [progressData, gameArea]);

  return { completeLevel, markWordAsWeak, getProgress };
};

export default usePlayerProgress;
