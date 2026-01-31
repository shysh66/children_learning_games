import React from 'react';
import { getProfiles, setActiveProfile } from '../utils/storage';

// Profile selection screen - "Who is playing?" Netflix-style
const ProfileSelectScreen = ({ onSelectProfile, onAddProfile, version, lastUpdate }) => {
  const profiles = getProfiles();

  const handleSelectProfile = (profile) => {
    setActiveProfile(profile.id);
    onSelectProfile(profile);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl sm:text-6xl font-black text-white mb-4 drop-shadow-2xl"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            מי משחק? 🎮
          </h1>
          <p className="text-xl text-white/70">בחר את השחקן שלך</p>
        </div>

        {/* Profile grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {/* Existing profiles */}
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-110"
            >
              {/* Avatar circle */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-4 border-white/30 hover:border-white/70 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/30">
                <span className="text-6xl sm:text-7xl">{profile.avatar}</span>
              </div>
              {/* Name */}
              <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                {profile.name}
              </span>
            </button>
          ))}

          {/* Add new profile button */}
          <button
            onClick={onAddProfile}
            className="group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-110"
          >
            {/* Plus circle */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/10 border-4 border-dashed border-white/30 hover:border-white/60 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20">
              <span className="text-6xl sm:text-7xl text-white/50 group-hover:text-white transition-colors">+</span>
            </div>
            {/* Label */}
            <span className="text-xl sm:text-2xl font-bold text-white/50 group-hover:text-white transition-colors">
              הוסף שחקן
            </span>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 text-4xl opacity-50">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🌟</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🎯</span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🏆</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>✨</span>
        </div>
      </div>

      {/* Version info - bottom left corner */}
      <div className="fixed bottom-4 left-4 text-white/40 text-sm">
        גרסא {version} עודכנה בתאריך {lastUpdate}
      </div>
    </div>
  );
};

export default ProfileSelectScreen;
