import React from 'react';
import { getTheme } from '../../data/themes';

const GAMES = [
  {
    id: 'polygonDetective',
    name: 'בלש המצולעים',
    description: 'גיאומטריה וצורות',
    icon: '🔍',
  },
  {
    id: 'logic',
    name: 'חשיבה ולוגיקה',
    description: 'השוואה וסדרות',
    icon: '🧠',
  },
  {
    id: 'smartMemory',
    name: 'זיכרון חכם',
    description: 'מצא את הזוגות!',
    icon: '🧩',
  },
];

const DetectiveHQ = ({ themeId, onBack, onSelectGame }) => {
  const theme = getTheme(themeId);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-transparent to-purple-900/30 pointer-events-none" />

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 drop-shadow-2xl" role="img" aria-label="detective">
            🕵️‍♂️
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl leading-tight">
            מפקדת הבלשים
          </h1>
          <p className="text-xl text-white/80">🔍 🧠 🧩 בחר משחק והתחל לחקור!</p>
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

export default DetectiveHQ;
