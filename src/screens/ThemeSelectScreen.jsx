import React, { useState, useEffect } from 'react';
import { themes } from '../data/themes';
import { getUniqueGamesCount, getActiveProfile, getSelectedTheme as getSavedTheme } from '../utils/storage';
import { getRankForTheme, getNextRankForTheme, getProgressToNextLevel, getGamesToNextLevel } from '../data/ranks';

// Theme selection screen - main menu after profile selection
const ThemeSelectScreen = ({ onSelectTheme, onSwitchUser, version, lastUpdate }) => {
  const [uniqueGames, setUniqueGames] = useState(0);
  const [rank, setRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  const [progress, setProgress] = useState(0);
  const [gamesToNext, setGamesToNext] = useState(0);
  const [profile, setProfile] = useState(null);
  const [, setCurrentThemeId] = useState('space');

  // Load rank, profile on mount
  useEffect(() => {
    const activeProfile = getActiveProfile();
    setProfile(activeProfile);

    const savedTheme = getSavedTheme() || 'space';
    setCurrentThemeId(savedTheme);

    const gamesCount = getUniqueGamesCount();
    setUniqueGames(gamesCount);

    const currentRank = getRankForTheme(savedTheme, gamesCount);
    setRank(currentRank);
    setNextRank(getNextRankForTheme(savedTheme, gamesCount));
    setProgress(getProgressToNextLevel(gamesCount));
    setGamesToNext(getGamesToNextLevel(gamesCount));
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 sm:p-8 font-sans relative"
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Profile display - Top Right (responsive) */}
        {profile && (
          <div className="sm:absolute sm:top-4 sm:right-4 mb-4 sm:mb-0 flex justify-center sm:justify-end">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border-2 border-white/30">
              <span className="text-3xl sm:text-4xl">{profile.avatar}</span>
              <div>
                <div className="text-base sm:text-lg font-bold text-white">{profile.name}</div>
                <button
                  onClick={onSwitchUser}
                  className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
                >
                  החלף שחקן ←
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rank Display - Top Center (themed) */}
        {rank && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border-2 border-white/30">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-4xl sm:text-5xl animate-pulse">{rank.icon}</span>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">{rank.title}</div>
                  <div className="text-sm sm:text-base text-white/80">{uniqueGames} משחקים ייחודיים</div>
                </div>
              </div>

              {/* Progress to next rank */}
              {nextRank && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-sm text-white/70 mb-1">
                    לדרגה הבאה: {nextRank.icon} {nextRank.title}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-center mt-2 text-white/70 text-sm">
                    עוד {gamesToNext} משחקים לדרגה הבאה
                  </div>
                </div>
              )}

              {/* Max rank message */}
              {!nextRank && (
                <div className="text-center mt-2 text-yellow-300 font-bold text-sm">
                  הגעת לדרגה הגבוהה ביותר!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 animate-bounce">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            🎮 משחקי החשבון שלי 🎮
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 font-semibold">בחר דמות למשחק!</p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onSelectTheme(key)}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:rotate-2 bg-white/20 backdrop-blur-md border-2 sm:border-4 border-white/30 hover:border-white/60"
            >
              <div className="text-5xl sm:text-7xl mb-2 sm:mb-4 animate-pulse">{theme.icon}</div>
              <div className="text-base sm:text-xl font-black text-white drop-shadow-lg">
                {theme.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Version info - bottom left corner */}
      <div className="fixed bottom-4 left-4 text-white/60 text-sm">
        גרסא {version} עודכנה בתאריך {lastUpdate}
      </div>
    </div>
  );
};

export default ThemeSelectScreen;
