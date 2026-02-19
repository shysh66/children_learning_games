import React from 'react';
import { getTheme } from '../../data/themes';

const GAMES = [
  {
    id: 'multiply',
    name: 'לוח הכפל',
    description: 'תרגול כפל מהנה',
    icon: '✖️',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'divide',
    name: 'חילוק',
    description: 'תרגול חילוק',
    icon: '➗',
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: 'addsub',
    name: 'חיבור וחיסור',
    description: 'תרגול חיבור וחיסור',
    icon: '➕➖',
    color: 'from-emerald-400 to-green-500',
  },
];

const MathKingdom = ({ themeId, onBack, onSelectGame }) => {
  const theme = getTheme(themeId);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      {/* Castle magical background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-transparent to-yellow-900/30 pointer-events-none" />

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 drop-shadow-2xl" role="img" aria-label="crown">
            👑
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl leading-tight">
            ממלכת החשבון
          </h1>
          <p className="text-xl text-white/80">➕ ➖ ✖️ ➗ בחר משחק והתחל לתרגל!</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`${theme.cardBg} rounded-3xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl group active:scale-95`}
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">{game.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2 leading-snug">{game.name}</h2>
              <p className="text-base text-white/70">{game.description}</p>
            </button>
          ))}
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
          >
            ← חזרה לתפריט
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathKingdom;
