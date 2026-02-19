import React from 'react';
import { gameModes } from '../data/levelConfigs';
import { getTheme } from '../data/themes';

// Game mode selection screen
const GameSelectScreen = ({ themeId, onSelectGame, onBack, onChangeZone }) => {
  const theme = getTheme(themeId);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 animate-bounce">{theme.icon}</div>
          <h1 className="text-6xl font-black text-white mb-6 drop-shadow-2xl">
            עולם ה{theme.name}
          </h1>
          <p className="text-2xl text-white/90">בחר משחק!</p>
        </div>

        {/* Game mode cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.entries(gameModes).filter(([, mode]) => !mode.hidden).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => onSelectGame(key)}
              className={`${theme.cardBg} rounded-3xl p-10 transform transition-all duration-300 hover:scale-105 group`}
            >
              <div className="text-6xl mb-4">{mode.icon}</div>
              <div className="text-4xl font-black text-white mb-2">{mode.name}</div>
              <div className="text-xl text-white/80">{mode.description}</div>
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onChangeZone || onBack}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            החלף אזור 🔄
          </button>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
          >
            ← חזרה
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSelectScreen;
