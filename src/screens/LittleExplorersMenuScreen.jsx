import React from 'react';
import { getTheme } from '../data/themes';

// Placeholder menu for the "Little Explorers" (ages 4-5) zone
const LittleExplorersMenuScreen = ({ themeId, onBack }) => {
  const theme = getTheme(themeId);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 animate-bounce">🧸</div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 drop-shadow-2xl">
            החוקרים הקטנים
          </h1>
          <p className="text-2xl text-white/90">גילאי 4-5</p>
        </div>

        {/* Coming soon placeholder */}
        <div className="bg-white/15 backdrop-blur-md rounded-3xl p-12 text-center border-4 border-dashed border-white/30 mb-8">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            בקרוב!
          </h2>
          <p className="text-xl text-white/80">
            משחקים חדשים לחוקרים הקטנים בדרך...
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mx-auto block px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
        >
          ← חזרה לבחירת אזור
        </button>
      </div>
    </div>
  );
};

export default LittleExplorersMenuScreen;
