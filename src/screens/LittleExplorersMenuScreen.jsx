import React from 'react';
import { getTheme } from '../data/themes';

const GAMES = [
  {
    id: 'sorter',
    name: 'המסדר הקטן',
    description: 'סדר פריטים לפי צבע, צורה או חיה!',
    icon: '🗂️',
    color: 'from-orange-400 to-pink-500',
  },
  {
    id: 'feedAnimal',
    name: 'זמן אוכל',
    description: 'האכל את החיות וספור כמה אכלו!',
    icon: '🍽️',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'smartMemory',
    name: 'זיכרון חכם',
    description: 'מצא זוגות של תמונות זהות!',
    icon: '🧩',
    color: 'from-purple-400 to-indigo-500',
  },
];

const LittleExplorersMenuScreen = ({ themeId, onBack, onSelectGame }) => {
  const theme = getTheme(themeId);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-8xl mb-4 animate-bounce">🧸</div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 drop-shadow-2xl">
            החוקרים הקטנים
          </h1>
          <p className="text-2xl text-white/90">גילאי 4-5</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`${theme.cardBg} rounded-3xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">{game.icon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">{game.name}</h2>
              <p className="text-lg text-white/70">{game.description}</p>
            </button>
          ))}

          {/* Coming soon placeholder for future games */}
          {GAMES.length % 2 !== 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-dashed border-white/20">
              <div className="text-6xl mb-4 opacity-50">🚧</div>
              <h2 className="text-2xl font-bold text-white/50 mb-2">בקרוב!</h2>
              <p className="text-lg text-white/40">משחקים נוספים בדרך...</p>
            </div>
          )}
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
