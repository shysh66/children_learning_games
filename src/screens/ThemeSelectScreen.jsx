import React from 'react';
import { themes } from '../data/themes';

// Theme selection screen - first screen users see
const ThemeSelectScreen = ({ onSelectTheme, version, lastUpdate }) => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12 animate-bounce">
          <h1
            className="text-7xl font-black text-white mb-4 drop-shadow-2xl"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            🎮 משחקי החשבון שלי 🎮
          </h1>
          <p className="text-2xl text-white/90 font-semibold">בחר דמות למשחק!</p>
        </div>

        {/* Theme cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onSelectTheme(key)}
              className="group relative overflow-hidden rounded-3xl p-8 transform transition-all duration-300 hover:scale-110 hover:rotate-2 bg-white/20 backdrop-blur-md border-4 border-white/30 hover:border-white/60"
            >
              <div className="text-8xl mb-4 animate-pulse">{theme.icon}</div>
              <div className="text-3xl font-black text-white drop-shadow-lg">
                {theme.name}
              </div>
            </button>
          ))}
        </div>

        {/* Version info */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <p className="text-white/80 text-lg font-semibold">
              גרסה {version} • {lastUpdate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectScreen;
