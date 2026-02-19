import React, { useState, useEffect } from 'react';
import { getActiveProfile } from '../utils/storage';

const ZONES = [
  {
    id: 'littleExplorers',
    icon: '🧸',
    title: 'החוקרים הצעירים',
    subtitle: 'גילאי 4-5',
    gradient: 'from-amber-400 via-orange-400 to-pink-400',
    hoverGlow: 'hover:shadow-orange-400/40',
    borderColor: 'border-amber-300/50',
    bgColor: 'bg-gradient-to-br from-amber-400/30 to-pink-400/30',
  },
  {
    id: 'aceAcademy',
    icon: '🚀',
    title: 'אלופי הכיתה',
    subtitle: 'גילאי 6+',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    hoverGlow: 'hover:shadow-blue-500/40',
    borderColor: 'border-cyan-300/50',
    bgColor: 'bg-gradient-to-br from-cyan-400/30 to-indigo-500/30',
  },
];

const ZoneSelectScreen = ({ onSelectZone, onBack, onParentsZone, onSwitchUser, version, lastUpdate }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setProfile(getActiveProfile());
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-8 font-sans relative"
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Profile display - Top Right */}
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

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            🎮 בחר אזור 🎮
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 font-semibold">
            לאן אתה רוצה לשחק?
          </p>
        </div>

        {/* Zone cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`group relative overflow-hidden rounded-3xl p-8 sm:p-12 transform transition-all duration-300 hover:scale-105 ${zone.bgColor} backdrop-blur-md border-4 ${zone.borderColor} hover:border-white/70 hover:shadow-2xl ${zone.hoverGlow}`}
            >
              {/* Animated background glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${zone.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

              <div className="relative z-10 flex flex-col items-center">
                <span className="text-7xl sm:text-9xl mb-4 sm:mb-6 block transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {zone.icon}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 drop-shadow-lg">
                  {zone.title}
                </h2>
                <p className="text-lg sm:text-xl text-white/80 font-medium">
                  {zone.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mx-auto block px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all mb-8"
        >
          ← חזרה לבחירת דמות
        </button>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 text-4xl opacity-50">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🎯</span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🏆</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>✨</span>
        </div>
      </div>

      {/* Parents Zone button - top left corner */}
      <button
        onClick={onParentsZone}
        className="fixed top-4 left-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/50 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
      >
        <span className="text-lg">📊</span>
        הורים
      </button>

      {/* Version info - bottom left corner */}
      <div className="fixed bottom-4 left-4 text-white/40 text-sm">
        גרסא {version} עודכנה בתאריך {lastUpdate}
      </div>
    </div>
  );
};

export default ZoneSelectScreen;
