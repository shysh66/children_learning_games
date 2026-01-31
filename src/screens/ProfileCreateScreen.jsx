import React, { useState } from 'react';
import { AVATARS, createProfile } from '../utils/storage';

// Profile creation screen - Enter name and choose avatar
const ProfileCreateScreen = ({ onProfileCreated, onBack }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [step, setStep] = useState(1); // 1 = name, 2 = avatar

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleCreateProfile = () => {
    const newProfile = createProfile(name, selectedAvatar);
    onProfileCreated(newProfile);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-2xl w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-lg"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        {step === 1 ? (
          /* Step 1: Enter Name */
          <div className="text-center">
            <h1
              className="text-4xl sm:text-5xl font-black text-white mb-8 drop-shadow-2xl"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              איך קוראים לך? 👋
            </h1>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הכנס שם..."
                autoFocus
                className="w-full max-w-md mx-auto block text-3xl text-center py-4 px-6 rounded-2xl bg-white/20 border-4 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              />

              <button
                type="submit"
                disabled={!name.trim()}
                className={`text-2xl font-bold py-4 px-12 rounded-full transition-all duration-300 ${
                  name.trim()
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-110 hover:shadow-xl hover:shadow-green-500/30'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                המשך ←
              </button>
            </form>

            {/* Fun decorations */}
            <div className="mt-12 flex justify-center gap-4 text-4xl opacity-50">
              <span className="animate-pulse">🎨</span>
              <span className="animate-pulse" style={{ animationDelay: '150ms' }}>✏️</span>
              <span className="animate-pulse" style={{ animationDelay: '300ms' }}>📝</span>
            </div>
          </div>
        ) : (
          /* Step 2: Choose Avatar */
          <div className="text-center">
            <h1
              className="text-4xl sm:text-5xl font-black text-white mb-4 drop-shadow-2xl"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              בחר תמונה, {name}! 🎨
            </h1>
            <p className="text-xl text-white/70 mb-8">איזו דמות מתאימה לך?</p>

            {/* Avatar grid */}
            <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto mb-8">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-4xl sm:text-5xl transition-all duration-300 ${
                    selectedAvatar === avatar
                      ? 'bg-white/40 border-4 border-yellow-400 scale-110 shadow-lg shadow-yellow-400/30'
                      : 'bg-white/15 border-4 border-transparent hover:bg-white/25 hover:scale-105'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="mb-8">
              <div className="inline-flex flex-col items-center gap-3 bg-white/10 rounded-3xl px-8 py-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-4 border-white/40 flex items-center justify-center">
                  <span className="text-6xl">{selectedAvatar}</span>
                </div>
                <span className="text-2xl font-bold text-white">{name}</span>
              </div>
            </div>

            {/* Create button */}
            <button
              onClick={handleCreateProfile}
              className="text-2xl font-bold py-4 px-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-110 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
            >
              בואו נתחיל! 🚀
            </button>

            {/* Back to name */}
            <button
              onClick={() => setStep(1)}
              className="block mx-auto mt-4 text-white/60 hover:text-white transition-colors"
            >
              ← חזרה לשינוי שם
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCreateScreen;
