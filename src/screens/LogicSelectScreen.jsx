import React from 'react';
import { getTheme } from '../data/themes';

// Logic & Thinking - Menu for logic game modes
const LogicSelectScreen = ({ themeId, onSelectGame, onBack }) => {
  const theme = getTheme(themeId);

  const logicGames = [
    {
      id: 'compare',
      name: 'התנין הרעב',
      englishName: 'Hungry Alligator',
      icon: '🐊',
      description: 'גדול, קטן או שווה? התנין תמיד אוכל את הגדול!',
      color: 'from-green-500 to-emerald-600',
      levels: '5 שלבים',
    },
    {
      id: 'sequence',
      name: 'רכבת המספרים',
      englishName: 'Number Train',
      icon: '🚂',
      description: 'השלם את הסדרה! מצא את המספר החסר ברכבת',
      color: 'from-orange-500 to-red-500',
      levels: '5 שלבים',
    },
  ];

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 sm:p-8`}
      dir="rtl"
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-pulse">🧠</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            חשיבה ולוגיקה
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mt-2">
            משחקי חשיבה מאתגרים!
          </p>
        </div>

        {/* Game cards */}
        <div className="grid gap-6 mb-8">
          {logicGames.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`bg-gradient-to-r ${game.color} rounded-3xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-right`}
            >
              <div className="flex items-center gap-4">
                <div className="text-6xl">{game.icon}</div>
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                    {game.name}
                  </div>
                  <div className="text-white/70">
                    {game.description}
                  </div>
                  <div className="text-sm text-white/50 mt-1">
                    {game.levels}
                  </div>
                </div>
                <div className="text-4xl text-white/50">←</div>
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mx-auto block px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
        >
          ← חזרה
        </button>
      </div>
    </div>
  );
};

export default LogicSelectScreen;
