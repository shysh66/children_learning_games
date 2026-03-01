import React from 'react';
import { getTheme } from '../data/themes';

// English Practice Zone - Menu for practice mini-games
const EnglishPracticeScreen = ({ themeId, onSelectGame, onBack }) => {
  const theme = getTheme(themeId);

  const practiceGames = [
    {
      id: 'memory',
      name: 'משחק הזיכרון',
      englishName: 'Memory Match',
      icon: '🎴',
      description: 'מצא זוגות והקשב למילים',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'findit',
      name: 'מצא את התמונה',
      englishName: 'Find it Fast!',
      icon: '🔍',
      description: 'הקשב ומצא את התמונה הנכונה',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'auditoryMatch',
      name: 'התאם לשמע',
      englishName: 'Auditory Match',
      icon: '👂',
      description: 'הקשב למילה ובחר את התמונה הנכונה',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'readingMatch',
      name: 'קרא ובחר',
      englishName: 'Reading Match',
      icon: '📖',
      description: 'ראה תמונה ובחר את המילה הנכונה',
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8`}
      dir="rtl"
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-pulse">🏋️</div>
          <h1 className="text-5xl font-black text-white mb-3">
            חדר כושר לאנגלית
          </h1>
          <p className="text-xl text-white/80">
            English Practice Zone
          </p>
          <p className="text-lg text-white/60 mt-2">
            תרגול מילים באנגלית דרך משחק!
          </p>
        </div>

        {/* Game cards */}
        <div className="grid gap-6 mb-8">
          {practiceGames.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`bg-gradient-to-r ${game.color} rounded-3xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-right`}
            >
              <div className="flex items-center gap-4">
                <div className="text-6xl">{game.icon}</div>
                <div className="flex-1">
                  <div className="text-3xl font-black text-white mb-1">
                    {game.name}
                  </div>
                  <div className="text-lg text-white/80 mb-1">
                    {game.englishName}
                  </div>
                  <div className="text-white/70">
                    {game.description}
                  </div>
                </div>
                <div className="text-4xl text-white/50">←</div>
              </div>
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 text-center">
          <p className="text-white/80">
            🔊 <strong>טיפ:</strong> הקשיבו היטב לכל מילה - זה עוזר לזכור!
          </p>
          <p className="text-yellow-300 mt-2">
            +50 XP לכל משחק שמסיימים!
          </p>
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

export default EnglishPracticeScreen;
