import React from 'react';
import { getTheme } from '../data/themes';

const KINGDOMS = [
  {
    id: 'numberKingdom',
    name: 'ממלכת המספרים',
    description: 'ספירה, חשבון ומשחקי מספרים!',
    icon: '🔢',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'letterKingdom',
    name: 'ממלכת האותיות והמילים',
    description: 'משחקי שפה, אותיות ומילים!',
    icon: '🏰',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'logicKingdom',
    name: 'ממלכת החשיבה',
    description: 'חשיבה, זיכרון ומיון!',
    icon: '🧠',
    color: 'from-orange-400 to-pink-500',
  },
];

const LittleExplorersMenuScreen = ({ themeId, onBack, onSelectGame, onOpenAlbum, onChangeZone }) => {
  const theme = getTheme(themeId);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      <div className="max-w-4xl w-full relative">
        {/* My Album button - top corner */}
        <button
          onClick={onOpenAlbum}
          className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 rounded-2xl px-4 py-3 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/30 flex items-center gap-2"
        >
          <span className="text-2xl">📒</span>
          <span className="text-lg">האלבום שלי</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-8xl mb-4 animate-bounce">🧸</div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 drop-shadow-2xl">
            החוקרים הצעירים
          </h1>
          <p className="text-2xl text-white/90">גילאי 4-5</p>
        </div>

        {/* Kingdoms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {KINGDOMS.map((kingdom) => (
            <button
              key={kingdom.id}
              onClick={() => onSelectGame(kingdom.id)}
              className={`${theme.cardBg} rounded-3xl p-10 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl group active:scale-95`}
            >
              <div className="text-7xl mb-5 group-hover:animate-bounce">{kingdom.icon}</div>
              <h2 className="text-3xl font-bold text-white mb-3 leading-snug">{kingdom.name}</h2>
              <p className="text-lg text-white/70">{kingdom.description}</p>
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

export default LittleExplorersMenuScreen;
