import React from 'react';
import { Lock } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes } from '../data/levelConfigs';
import { StarRating } from '../components';
import { isLevelUnlocked, getLevelStars } from '../utils/storage';

// Level map screen - shows progression through levels
const LevelMapScreen = ({ themeId, gameMode, onSelectLevel, onBack }) => {
  const theme = getTheme(themeId);
  const mode = gameModes[gameMode];
  const levels = mode.levels;
  const totalLevels = mode.totalLevels;

  // Generate level nodes
  const levelNodes = [];
  for (let i = 1; i <= totalLevels; i++) {
    const unlocked = isLevelUnlocked(gameMode, i);
    const stars = getLevelStars(gameMode, i);
    const levelConfig = levels[i];

    levelNodes.push({
      id: i,
      name: levelConfig?.name || `שלב ${i}`,
      description: levelConfig?.description || '',
      unlocked,
      stars,
    });
  }

  return (
    <div
      className={`min-h-screen ${theme.mapBg || theme.bg} flex flex-col items-center p-8 ${theme.font}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-6xl">{theme.icon}</span>
          <span className="text-6xl">{mode.icon}</span>
        </div>
        <h1 className="text-5xl font-black text-white drop-shadow-2xl">
          {mode.name}
        </h1>
        <p className="text-xl text-white/80 mt-2">בחר שלב לשחק</p>
      </div>

      {/* Level map */}
      <div className="flex-1 w-full max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          {levelNodes.map((level) => (
            <button
              key={level.id}
              onClick={() => level.unlocked && onSelectLevel(level.id)}
              disabled={!level.unlocked}
              className={`
                relative rounded-3xl p-6 transition-all duration-300 transform
                ${level.unlocked
                  ? `${theme.cardBg} hover:scale-105 cursor-pointer`
                  : `${theme.lockedColor} cursor-not-allowed`
                }
              `}
            >
              {/* Lock icon for locked levels */}
              {!level.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="text-white/50" size={48} />
                </div>
              )}

              {/* Level content */}
              <div className={level.unlocked ? '' : 'opacity-30'}>
                <div className="text-4xl font-black text-white mb-2">
                  {level.name}
                </div>
                <div className="text-lg text-white/80 mb-3">
                  {level.description}
                </div>

                {/* Stars */}
                <div className="flex justify-center">
                  <StarRating
                    stars={level.stars}
                    maxStars={3}
                    size="large"
                    showEmpty={level.unlocked}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
      >
        ← חזרה לבחירת משחק
      </button>
    </div>
  );
};

export default LevelMapScreen;
